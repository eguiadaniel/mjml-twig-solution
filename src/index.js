var express = require("express");
var mjml = require("mjml");
var fs = require("fs");
var Twig = require("twig");
var path = require("path");

var app = express();

app.get("/:template?/:dataid?", function(req, res) {
  const templateName = req.params.template || "example";
  const dataId = req.params.dataid || 0;

  const mjmlContent = fs.readFileSync(
    "src/stuff/" + templateName + "/template.mjml",
    "utf8"
  );

  const rawTemplateData = fs.readFileSync(
    "src/stuff/" + templateName + "/data." + dataId + ".json",
    "utf8"
  );

  const templateData = JSON.parse(rawTemplateData);

  const mjmlOutput = mjml(mjmlContent, {
    filePath: path.join(__dirname, "/stuff/" + templateName, "template.mjml")
  });

  if (mjmlOutput.errors && mjmlOutput.errors.length) {
    res.send(
      mjmlOutput.errors.map(error => error.formattedMessage).join("<br />")
    );
    return;
  }

  fs.writeFileSync(
    "src/stuff/" + templateName + "/template.twig",
    mjmlOutput.html
  );

  const template = Twig.twig({
    data: mjmlOutput.html
  });

  const finalHtml = template.render(templateData);

  fs.writeFileSync("src/stuff/" + templateName + "/template.html", finalHtml);

  res.send(finalHtml);
});

app.listen(8080);
