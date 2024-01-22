const express = require('express');
const fs = require('fs');
const ini = require('ini');
const bodyParser = require('body-parser');

// Read the contents of the INI file
const iniFileContent = fs.readFileSync('config.ini', 'utf-8');

// Remove square brackets and parentheses from the header
const modifiedIniFileContent = iniFileContent.replace(/^\[.*\]/, '').replace(/\(|\)/g, '');

// Parse the modified INI file
const parsedIni = ini.parse(modifiedIniFileContent);

// Ensure that the 'OptionSettings' property exists
if (parsedIni['OptionSettings']) {
  // Extract the OptionSettings value as a string
  const optionSettingsString = parsedIni['OptionSettings'];

  // Convert the OptionSettings string to a JavaScript object
  const optionSettingsObj = optionSettingsString.split(',').reduce((acc, pair) => {
    const [key, value] = pair.split('=');
    acc[key.trim()] = parseFloat(value.trim()) || value.trim();
    return acc;
  }, {});

  // Write the parsed values to a temporary JSON file
  fs.writeFileSync('temp.json', JSON.stringify(optionSettingsObj, null, 2));

  console.log('Values parsed and written to temp-json-file.json');
} else {
  console.error('Error: OptionSettings property not found in the provided INI file.');
}

const app = express();
const port = 3005;

// Use express.urlencoded middleware
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  // Read the contents of the temp JSON file
  const tempJsonContent = fs.readFileSync('temp.json', 'utf-8');
  const parsedTempJson = JSON.parse(tempJsonContent);

  // Serve the HTML form with pre-filled values
  res.send(`
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 20px;
      }

      form {
        max-width: 500px;
        margin: 0 auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }

      label {
        display: block;
        margin-bottom: 8px;
      }

      input {
        width: 100%;
        padding: 8px;
        margin-bottom: 16px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      input[type="submit"] {
        background-color: #4caf50;
        color: #fff;
        cursor: pointer;
      }

      input[type="submit"]:hover {
        background-color: #45a049;
      }
    </style>
  </head>
  <body>
    <form action="/save" method="post">
      ${Object.entries(parsedTempJson).map(([key, value]) => `
        <label for="${key}">${key}:</label>
        <input type="text" id="${key}" name="${key}" value="${value}"><br>
      `).join('')}
      <input type="submit" value="Save">
    </form>
  </body>
  <footer> This dogshit was made by Nate Scholze for RCBound </footer>
</html>

  `);
});

app.post('/save', (req, res) => {
    // Read the submitted form data
    const formData = req.body;
    console.log("Ban list ignored, filled with default")
  
    // Convert form data to the desired format
    const formattedData = `[${Object.entries(formData).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join(',')}]`;
  
    // Write the INI file
    fs.writeFileSync('new_config.ini', "[/Script/Pal.PalGameWorldSettings]" + "\n" + "OptionSettings=" + formattedData.replace(/\[/g, '(').replace(/\]/g, ')').replace(/"/g, '').replace(formData.BanListURL, '"https://api.palworldgame.com/api/banlist.txt"').replace(formData.ServerName, '"' + formData.ServerName + '"').replace(formData.ServerDescription, '"' + formData.ServerDescription + '"').replace(formData.AdminPassword, '"' + formData.AdminPassword + '"').replace(formData.ServerPassword, '"' + formData.ServerPassword + '"').replace(formData.PublicIP, '"' + formData.PublicIP + '"').replace(formData.Region, '"' + formData.Region + '"'));
  
    res.send('Config saved successfully!');
  });
  
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });