const Slack = require('slack-node');

class SlackNotifier {

  constructor(
    webhookUri = 'https://hooks.slack.com/services/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',
    channel = '#bot-testing'
  ) {
    this.slack = new Slack();
    this.slack.setWebhook(webhookUri);
    this.channel = channel;
  }

  notify(text) {
    this.slack.webhook({
      channel: this.channel,
      username: this.username,
      // icon_emoji: ":ghost:"
      text: text
    });
  }


}

module.exports = SlackNotifier



