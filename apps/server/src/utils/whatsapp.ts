export interface WhatsAppMessage {
  recipient: string;
  statusUrl: string;
}

export interface WhatsAppSender {
  send(message: WhatsAppMessage): Promise<void>;
}

/** Sends an approved Meta template with the status URL as its first body parameter. */
export function createWhatsAppSender(config: {
  version: string;
  phoneNumberId: string;
  accessToken: string;
  templateName: string;
  language: string;
}): WhatsAppSender {
  if (
    !/^v\d+\.\d+$/.test(config.version) ||
    !/^\d+$/.test(config.phoneNumberId) ||
    !config.accessToken ||
    !config.templateName ||
    !config.language
  ) {
    throw new Error('Konfigurasi WhatsApp tidak valid');
  }
  return {
    async send(message) {
      if (!/^\d{8,15}$/.test(message.recipient)) {
        throw new Error('Nomor WhatsApp harus menggunakan kode negara');
      }
      const response = await fetch(
        `https://graph.facebook.com/${config.version}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: message.recipient,
            type: 'template',
            template: {
              name: config.templateName,
              language: { code: config.language },
              components: [
                {
                  type: 'body',
                  parameters: [{ type: 'text', text: message.statusUrl }],
                },
              ],
            },
          }),
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!response.ok) {
        throw new Error(`Pengiriman WhatsApp gagal (${response.status})`);
      }
    },
  };
}
