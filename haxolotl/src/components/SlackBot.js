import express from 'express';
import pkg from '@slack/bolt';
const { App } = pkg
import bodyParser from 'body-parser';
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
// Create a Bolt app
const boltApp = new App({
    appToken: process.env.SLACK_APP_TOKEN,
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGN
  });

export const slackRouter = express.Router();

slackRouter.post('/haxolotl', async (req, res) => {
  const { command, user_id, trigger_id } = req.body;
  if (command === "/haxolotl") {
    try {
        await boltApp.client.views.open({
            trigger_id: body.trigger_id,
            view: {
                type: 'modal',
                callback_id: 'haxolotl_modal',
                title: {
                    type: 'plain_text',
                    text: 'Haxolotl',
                },
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: 'Click the button below to open the Haxolotl website:',
                        },
                        accessory: {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Open Haxolotl',
                            },
                            action_id: 'open_haxolotl',
                            url: `https://haxolotl.imnoah.com/?userid=${body.user_id}`,
                        },
                    },
                ],
            },
        });
    } catch (error) {
        console.error(error);
    }
  }
});

// Start the Bolt app
(async () => {
    try {
      await boltApp.start();
      console.log('Bolt app is running!');
    } catch (error) {
      console.error('Failed to start Bolt app:', error);
      process.exit(1);
    }
  })();