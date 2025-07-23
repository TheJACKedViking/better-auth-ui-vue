export interface EmailTemplateProps {
    classNames?: any
    action?: string
    baseUrl?: string
    content: string
    heading: string
    imageUrl?: string
    preview?: string
    siteName?: string
    url?: string
    variant?: "vercel"
}

export function generateEmailHTML(props: EmailTemplateProps): string {
    const baseUrl = props.baseUrl || process.env.BASE_URL || ''
    const imageUrl = props.imageUrl || `${baseUrl}/apple-touch-icon.png`
    const siteName = props.siteName || process.env.SITE_NAME || ''
    const preview = props.preview || props.heading

    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="light dark" name="color-scheme" />
    <meta content="light dark" name="supported-color-schemes" />
    <style type="text/css">
        :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }
        
        html, body {
            background-color: #ffffff;
            color: #000000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }

        a {
            color: #000000;
        }

        .border-color {
            border-color: #eaeaea;
        }

        .action-button {
            background-color: #000000 !important;
            color: #ffffff !important;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
            font-size: 12px;
            display: inline-block;
        }

        @media (prefers-color-scheme: dark) {
            html, body {
                background-color: #000000 !important;
                color: #ffffff !important;
            }

            a {
                color: #ffffff;
            }

            .border-color {
                border-color: #333333 !important;
            }

            .action-button {
                background-color: rgb(38, 38, 38) !important;
                color: #ffffff !important;
            }
        }
    </style>
</head>
<body style="margin: auto; padding: 8px;">
    <div style="max-width: 465px; margin: 40px auto; padding: 20px; border: 1px solid; border-radius: 4px;" class="border-color">
        ${imageUrl ? `
        <div style="text-align: center; margin-top: 32px;">
            <img src="${imageUrl}" alt="${siteName}" width="40" height="40" style="border-radius: 50%;" />
        </div>
        ` : ''}
        
        <h1 style="margin: 30px 0; padding: 0; text-align: center; font-size: 24px; font-weight: bold;">
            ${props.heading}
        </h1>
        
        <div style="font-size: 14px; line-height: 24px;">
            ${props.content}
        </div>
        
        ${props.action && props.url ? `
        <div style="text-align: center; margin: 32px 0;">
            <a href="${props.url}" class="action-button">
                ${props.action}
            </a>
        </div>
        ` : ''}
        
        <hr style="margin: 26px 0; border: 0; border-top: 1px solid;" class="border-color" />
        
        <div style="color: #666666; font-size: 12px; line-height: 24px;">
            ${siteName ? `${siteName} ` : ''}
            ${baseUrl ? `<a href="${baseUrl}" style="text-decoration: none;">${baseUrl.replace(/^https?:\/\//, '')}</a>` : ''}
        </div>
    </div>
</body>
</html>
    `.trim()
}