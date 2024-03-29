const { SlashCommandBuilder } = require("discord.js");
const dayjs = require("dayjs");
const axios = require("axios");
const { time } = require('discord.js');

// make non mobile mode 👀 ?
module.exports = {
  data: new SlashCommandBuilder()
    .setName("scouting")
    .setDescription("Gets scouting data from Jake's Amazing Google Sheet")
    .addStringOption((option) =>
      option.setName('team')
        .setDescription('Team number (defaults to a list of top scouted teams)')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName('sort-by')
        .setDescription('Category to sort by (defaults to sum total points)')
        .setRequired(false)
        .addChoices(
          { name: 'Mobility', value: "Mobility" },
          { name: 'Speaker Auto', value: "Speaker_Auto" },
          { name: 'Amp Auto', value: "Amp_Auto" },
          { name: 'Speaker', value: "Speaker" },
          { name: 'Amp', value: "Amp" },
          { name: 'Amplified Speaker', value: "Amplified_Speaker_Scores" },
          { name: 'Climb', value: "Climb" },
          { name: 'Trap', value: "Trap" },
          { name: 'Park', value: "Park" },
          { name: 'Times Defence Played', value: "Defense_Played" },
          { name: 'Defensive Efficiency', value: "Defensive_Effiecency" },
          { name: 'Teleop Cycles', value: "Teleop_Cycles" },
          { name: 'Times Died', value: "Died" },
          { name: 'Sum Auto Points', value: "Sum_Auto_Points" },
          { name: 'Sum Teleop Points', value: "Sum_Teleop_Points" },
          { name: 'Sum Endgame Points', value: "Sum_Endgame_Points" },
          { name: 'Sum Total Points', value: "Sum_Total_Points" },
        )
    )
    .addBooleanOption((option) =>
      option.setName('overall-scoring')
        .setDescription('Show current overall scoring image')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    if(interaction.options.getBoolean("overall-scoring")){
      return interaction.editReply({
        content: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRd3PjVAlosmxU1u5N223lgHfgukW5bLagD_Gkz-KiR793DlrelyzhnEATaPbiqDxNeQVLrS7PmVsOb/pubchart?oid=1047394600&format=image",
      });
    }

    let team = interaction.options.getString("team") || null;
    let sortBy = interaction.options.getString("sort-by") || "Sum_Total_Points";

    if (team != null) {
      const res = await axios.get(`https://dozer-backend.vercel.app/team/${team}`);
      let embed = {
        color: 0xF79A2A,
        title: `Scouting Data for Team ${team}`,
        fields: [],
      };

      Object.keys(res.data).forEach((key) => {
        let k = key;
        let val = res.data[key];
        if (key === "Team") {
          return;
        }
        k = k.split("_").join(" ");
        if(key === "Mobility"){
          (val == 1) ? val = ":white_check_mark:" : val = ":x:";
        }
        if(key === "Defensive_Effiecency"){
          k = "Defensive Efficiency";
        }
        if(key === "Defense_Played"){
          k = k+'%';
        }
        embed.fields.push({ name: k, value: val, inline: true});
      });

      interaction.editReply({
        embeds: [embed],
      });

    } else {
      const res = await axios.get(`https://dozer-backend.vercel.app/top-teams?category=${sortBy}`);
      // this is mobile version basically lolz
      let msg = '';
      // already limited by api to 5 teams (use ?count to override)
      res.data.forEach(team => {
        msg += `**${team.team}** - ${team[sortBy]}\n`;
      });
      const embed = {
        color: 0xF79A2A,
        description: msg,
        title: `Top Teams in ${sortBy}`,
      };

      interaction.editReply({
        embeds: [embed],
      })
    }

  },
};
