export function inviteEmailTemplate({
  inviterName,
  friendName,
  chatTitle,
  chatPreview,
  shareUrl,
}: {
  inviterName: string;
  friendName: string;
  chatTitle: string;
  chatPreview: string;
  shareUrl: string;
}) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <body
    style='background-color:rgb(249,250,251);font-family:ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";padding-top:40px;padding-bottom:40px'>
    <!--$-->
    <div
      style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
      ${inviterName} shared an AI conversation with you
      <div>
         ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿
      </div>
    </div>
    <table
      align="center"
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="margin-left:auto;margin-right:auto;background-color:rgb(255,255,255);border-radius:16px;box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgb(0,0,0,0.05);max-width:600px;padding-left:48px;padding-right:48px;padding-top:48px;padding-bottom:48px">
      <tbody>
        <tr style="width:100%">
          <td>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="text-align:center;margin-bottom:40px">
              <tbody>
                <tr>
                  <td>
                    <div
                      style="width:64px;height:64px;background-color:rgb(0,0,0);border-radius:16px;margin-left:auto;margin-right:auto;margin-bottom:24px;display:flex;align-items:center;justify-content:center">
                      <div
                        style="color:rgb(255,255,255);font-size:24px;font-weight:700">
                        AI
                      </div>
                    </div>
                    <h1
                      style="font-size:28px;font-weight:700;color:rgb(0,0,0);margin:0px;line-height:1.2">
                      Check out this conversation
                    </h1>
                    <p
                      style="font-size:16px;color:rgb(75,85,99);margin-top:8px;margin-bottom:0px;line-height:24px">
                      ${inviterName}<!-- -->
                      wants to share an AI chat with you
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="margin-bottom:40px">
              <tbody>
                <tr>
                  <td>
                    <p
                      style="font-size:16px;color:rgb(55,65,81);line-height:1.5;margin-bottom:16px;margin-top:16px">
                      Hey
                      <!-- -->${friendName}<!-- -->,
                    </p>
                    <p
                      style="font-size:16px;color:rgb(55,65,81);line-height:1.5;margin-bottom:24px;margin-top:16px">
                      I had an interesting conversation with an AI about
                      <strong>${chatTitle}</strong> and thought
                      you&#x27;d find it useful. Click the link below to see
                      what we discussed!
                    </p>
                    <div
                      style="background-color:rgb(249,250,251);border-radius:12px;padding:20px;margin-bottom:24px;border-left-width:4px;border-color:rgb(0,0,0)">
                      <p
                        style="font-size:14px;color:rgb(75,85,99);margin-bottom:8px;font-weight:600;line-height:24px;margin-top:16px">
                        Preview:
                      </p>
                      <p
                        style="font-size:14px;color:rgb(55,65,81);line-height:1.4;margin:0px;font-style:italic;margin-bottom:0px;margin-top:0px;margin-left:0px;margin-right:0px">
                        &quot;<!-- -->${chatPreview}<!-- -->...&quot;
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="text-align:center;margin-bottom:32px">
              <tbody>
                <tr>
                  <td>
                    <a
                      href="${shareUrl}"
                      style="background-color:rgb(0,0,0);color:rgb(255,255,255);padding-left:32px;padding-right:32px;padding-top:16px;padding-bottom:16px;border-radius:12px;font-size:16px;font-weight:600;text-decoration-line:none;box-sizing:border-box;display:inline-block;line-height:100%;text-decoration:none;max-width:100%;mso-padding-alt:0px;padding:16px 32px 16px 32px"
                      target="_blank"
                      ><span
                        ><!--[if mso]><i style="mso-font-width:400%;mso-text-raise:24" hidden>&#8202;&#8202;&#8202;&#8202;</i><![endif]--></span
                      ><span
                        style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:12px"
                        >View Conversation</span
                      ><span
                        ><!--[if mso]><i style="mso-font-width:400%" hidden>&#8202;&#8202;&#8202;&#8202;&#8203;</i><![endif]--></span
                      ></a
                    >
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="text-align:center;margin-bottom:40px">
              <tbody>
                <tr>
                  <td>
                    <p
                      style="font-size:14px;color:rgb(107,114,128);margin-bottom:8px;line-height:24px;margin-top:16px">
                      Or copy and paste this link in your browser:
                    </p>
                    <a
                      href="${shareUrl}"
                      style="font-size:14px;color:rgb(0,0,0);text-decoration-line:underline;word-break:break-all"
                      target="_blank"
                      >${shareUrl}</a
                    >
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="background-color:rgb(249,250,251);border-radius:12px;padding:20px;margin-bottom:40px">
              <tbody>
                <tr>
                  <td>
                    <p
                      style="font-size:14px;color:rgb(75,85,99);line-height:1.4;margin:0px;margin-bottom:0px;margin-top:0px;margin-left:0px;margin-right:0px">
                      💡 <strong>Note:</strong> This is a shared AI
                      conversation. You&#x27;ll be able to read our entire
                      discussion and continue the conversation if you&#x27;d
                      like.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="border-top-width:1px;border-color:rgb(229,231,235);padding-top:32px">
              <tbody>
                <tr>
                  <td>
                    <p
                      style="font-size:12px;color:rgb(156,163,175);text-align:center;line-height:1.4;margin-bottom:8px;margin-top:16px">
                      This conversation was shared by
                      <!-- -->${inviterName}
                    </p>
                    <p
                      style="font-size:12px;color:rgb(156,163,175);text-align:center;line-height:1.4;margin:0px;margin-bottom:0px;margin-top:0px;margin-left:0px;margin-right:0px">
                      P4 Chat • Recife, Brazil
                    </p>
                    <p
                      style="font-size:12px;color:rgb(156,163,175);text-align:center;line-height:1.4;margin-top:8px;margin-bottom:0px">
                      <a
                        href="https://p4-chat.vercel.app/"
                        style="color:rgb(156,163,175);text-decoration-line:underline"
                        target="_blank"
                        >Unsubscribe</a
                      >
                      • © 2025 P4 Chat
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--7--><!--/$-->
  </body>
</html>
`;
}
