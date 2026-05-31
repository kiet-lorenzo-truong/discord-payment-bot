const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createres')
    .setDescription('Save or update a text shortcut image response.')
    .addStringOption(option => 
      option.setName('name')
        .setDescription('The shortcut trigger word (e.g. vanu)')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('link')
        .setDescription('The direct image URL link')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('ping')
        .setDescription('Choose True if you want the bot to ping the user who typed the shortcut word')
        .setRequired(false)),
  
  async execute(interaction) {
    // Admin only check
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Admin only command.', ephemeral: true });
    }

    const name = interaction.options.getString('name').trim().toLowerCase();
    const link = interaction.options.getString('link');
    const ping = interaction.options.getBoolean('ping') || false;

    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      return interaction.reply({ content: '❌ Link must start with http:// or https://', ephemeral: true });
    }

    const galleryPath = path.join(__dirname, '..', 'gallery.json');
    let gallery = {};
    if (fs.existsSync(galleryPath)) {
      try {
        gallery = JSON.parse(fs.readFileSync(galleryPath, 'utf-8'));
      } catch (e) {
        console.error('Failed to parse gallery.json', e);
      }
    }

    gallery[name] = {
      url: link,
      should_ping: ping
    };
    fs.writeFileSync(galleryPath, JSON.stringify(gallery, null, 2), 'utf-8');

    const pingStatus = ping ? 'Enabled' : 'Disabled';
    const embed = new EmbedBuilder()
      .setTitle('✅ Shortcut Registered')
      .setDescription(`Typing \`${name}\` will now display your custom image frame.\nPing member behavior: **${pingStatus}**.`)
      .setColor('#00ff00')
      .setThumbnail(link);

    await interaction.reply({ embeds: [embed] });
  }
};
