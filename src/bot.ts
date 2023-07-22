import { Bot, Context, session } from 'grammy';
import {
  Conversation,
  ConversationFlavor,
  conversations,
  createConversation,
} from '@grammyjs/conversations';
import { Menu, MenuRange } from '@grammyjs/menu';

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>('TOKEN');

bot.use(
  session({
    initial() {
      return {};
    },
  })
);

bot.use(conversations());

const buttons = ['1', '2'];

export async function test_conv(conversation: MyConversation, ctx: MyContext) {
  await conversation.run(test_menu);
  const user_input = await conversation.waitFor(':text');

  buttons.push(user_input.msg.text);
  //@ts-expect-error
  ctx.menu.update();
}

bot.use(createConversation(test_conv));

const test_menu = new Menu<MyContext>('test-menu').dynamic(async (ctx) => {
  const range = new MenuRange<MyContext>();

  buttons.forEach((button) => {
    range.text(button).row();
  });

  range.text('test', async (ctx) => {
    await ctx.reply('enter a number', { reply_markup: { force_reply: true } });
    await ctx.conversation.enter('test_conv', {
      overwrite: true,
    });
  });

  return range;
});

bot.use(test_menu);

bot.on(':text', (ctx) => ctx.reply('test', { reply_markup: test_menu }));

bot.start({
  drop_pending_updates: true,
  allowed_updates: ['message', 'callback_query'],
});
