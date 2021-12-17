require('dotenv').config()
const gotiny = require('gotiny')
const { App } = require('@slack/bolt')

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
})

const SlackLinkRegex = /<(http:\/\/.+\|)?(.*)>/

app.shortcut('gotiny', async ({ shortcut, ack, say, client }) => {
  try {
    await ack()

    let message = shortcut.message.text

    if (SlackLinkRegex.test(message)) {
      // Filter out the unparsed plain text from the sent message
      message = message.match(SlackLinkRegex)[2]
    }

    try {

      // Get GoTiny link and send the response in the chat
      const res = await gotiny.set(message)
      const tiny = res[0].tiny

      await say(tiny)

    } catch (err) {

      // If no link is found, show modal
      await client.views.open({
        trigger_id: shortcut.trigger_id,
        view: {
          type: 'modal',
          title: {
            type: 'plain_text',
            text: 'Unable to find link',
            emoji: true,
          },
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `We could not find a link in this message!`,
              },
            },
          ],
        },
      })

      console.log('Could not find link: ' + shortcut.message.text)
    }
  } catch (error) {
    console.log(error)
  }
})

// Start Slack Bot
;(async () => {
  await app.start()
  console.log('GoTiny Slack Bot is running')
})()
