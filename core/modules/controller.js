'use strict';
const Logger = require('./Logger.js');
const GuildManager = require('./GuildManager.js');
const Command = require('./Command.js');
const Util = require('./util/Util.js');
const CleverChannel = require('./CleverChannel.js');
const Datastore = require('./Datastore.js');

const cleverChannels = new Map();
const blacklist = new Datastore('./core/data/blacklist.json', {
  persistence: false,
  data: []
});


async function destroyBot(client) {
  Logger.main.log('INFO', 'Shutting Down...');

  await Util.asyncForEach(client.guilds.array(), async (guild) => {
    await GuildManager.unload(guild.id);
    Logger.main.log('DATA', `Guild ${Logger.logifyGuild(guild)} unloaded`);
  });

  await Logger.main.end();
  
  await client.destroy();
}

async function getAccessiblePlugins(user, client) {
  let userPlugins = Command.pluginsDM.slice(0);

  await Util.asyncForEach([...GuildManager.all.values()], async (manager) => {
    let guild = client.guilds.get(manager.id);

    if (!guild.members.has(user.id)) return;

    let plugins = await manager.configdb.get('plugins');

    plugins.forEach((plugin) => {
      if (!userPlugins.includes(plugin)) userPlugins.push(plugin);
    });
  });

  return userPlugins;
}

function onGuildMemberAdd(member, manager) {
  manager.log('LOGGER', `User ${Logger.logifyUser(member)} added to guild`);
}

function onGuildMemberRemove(member, manager) {
  manager.log('LOGGER', `User ${Logger.logifyUser(member)} removed from guild`);
}

function onMessageUpdate(oldMessage, newMessage, manager) {
  const oldContent = `Old Content: \"${Logger.escape(Logger.cleanContent(oldMessage))}\"`;
  const oldMeta = Logger.stylizeMetaData(oldMessage).map((e) => '  ' + e);
  const newContent = `New Content: \"${Logger.escape(Logger.cleanContent(newMessage))}\"`;
  const newMeta = Logger.stylizeMetaData(newMessage).map((e) => '  ' + e);
  manager.log('LOGGER', `Message by user ${Logger.logifyUser(oldMessage.author)} edited in channel ${Logger.logify(oldMessage.channel)}`, oldContent, ...oldMeta, newContent, ...newMeta);
}

function onMessageDelete(message, manager) {
  const content = `Content: \"${Logger.escape(Logger.cleanContent(message))}\"`;
  const meta = Logger.stylizeMetaData(message).map((e) => '  ' + e);
  manager.log('LOGGER', `Message by user ${Logger.logifyUser(message.author)} deleted in channel ${Logger.logify(message.channel)}`, content, ...meta);
}

function onMessageDeleteBulk(messages, manager) {
  const list = messages.array().map((message) => {
    const header = `Message by user ${Logger.logifyUser(message.author)}:`;
    const content = `  Content: \"${Logger.escape(Logger.cleanContent(message))}\"`;
    const meta = Logger.stylizeMetaData(message).map((e) => '    ' + e);
    return [header, content, ...meta];
  });
  manager.log('LOGGER', `Bulk message deletion in channel ${Logger.logify(messages.first().channel)}`, ...[].concat(...list));
}

function onMessage(message, manager) {
  const content = `Content: \"${Logger.escape(Logger.cleanContent(message))}\"`;
  const meta = Logger.stylizeMetaData(message).map((e) => '  ' + e);
  manager.log('LOGGER', `Message by user ${Logger.logifyUser(message.author)} sent in channel ${Logger.logify(message.channel)}`, content, ...meta);
}

function userOwnsAGuild(user, client) {
  return client.guilds.some((guild) => guild.owner.id === user.id);
}

async function getCleverBotResponse(msg, ch) {
  if (!cleverChannels.has(ch)) cleverChannels.set(ch, new CleverChannel(25));
  const channel = cleverChannels.get(ch);
  return await channel.send(msg).catch((err) => {
    Logger.main.log('WARN', 'Error while Communicating with CleverBot API: ' + err.message);
  });
}

async function blacklistAdd(user) {
  let out;
  await blacklist.transform((data) => {
    if (!data.includes(user.id)) {
      data.push(user.id);
      out = true;
    } else {
      out = false;
    }
    return data;
  });
  return out;
}

async function blacklistRemove(user) {
  let out;
  await blacklist.transform((data) => {
    if (data.includes(user.id)) {
      data.splice(data.indexOf(user.id), 1);
      out = true;
    } else {
      out = false;
    }
    return data;
  });
  return out;
}

function resolveUser(val, client) {
  if (!val || typeof value !== 'string' || !val.trim().length) return null;
  if (client.users.has(val.trim())) return client.users.get(val.trim());
  const match = val.trim().match(/[0-9]+/);
  if (!match) return null;
  return client.users.get(match[0]) || null;
}

function setup() {
  
}

/*
const { scheduleJob } = require('node-schedule');

let job = scheduleJob('15 7 * * *', () => {

});
*/

module.exports = {
  destroyBot,
  getAccessiblePlugins,
  userOwnsAGuild,
  getCleverBotResponse,

  onGuildMemberAdd,
  onGuildMemberRemove,
  onMessageUpdate,
  onMessageDelete,
  onMessageDeleteBulk,
  onMessage,

  blacklistAdd,
  blacklistRemove,

  resolveUser,

  setup,

  firstReady: false
};
