export function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SportShot</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e0;">
          <!-- Header -->
          <tr>
            <td style="background:#1D9E75;padding:24px 32px;">
              <span style="color:#ffffff;font-size:22px;font-weight:600;letter-spacing:-0.5px;">SportShot</span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eeede8;background:#fafaf8;">
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
                Este email fue enviado automáticamente por SportShot.<br/>
                Si tienes alguna duda escríbenos a <a href="mailto:hola@sportshot.app" style="color:#1D9E75;text-decoration:none;">hola@sportshot.app</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function heading(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1a1a;line-height:1.3;">${text}</h1>`
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7;">${text}</p>`
}

export function metaTable(rows: Array<{ label: string; value: string }>): string {
  const cells = rows.map(({ label, value }) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0efe8;font-size:13px;color:#888;width:40%;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0efe8;font-size:13px;color:#1a1a1a;font-weight:500;">${value}</td>
    </tr>`).join('')

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">${cells}</table>`
}

export function ctaButton(text: string, url: string): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="background:#1D9E75;border-radius:8px;">
          <a href="${url}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:500;text-decoration:none;">${text}</a>
        </td>
      </tr>
    </table>`
}

export function infoBox(text: string, type: 'info' | 'warning' | 'success' = 'info'): string {
  const colors = {
    info:    { bg: '#E6F1FB', border: '#185FA5', text: '#185FA5' },
    warning: { bg: '#FAEEDA', border: '#854F0B', text: '#854F0B' },
    success: { bg: '#E1F5EE', border: '#1D9E75', text: '#0F6E56' },
  }
  const c = colors[type]
  return `
    <div style="background:${c.bg};border-left:3px solid ${c.border};border-radius:0 8px 8px 0;padding:14px 16px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:${c.text};line-height:1.6;">${text}</p>
    </div>`
}
