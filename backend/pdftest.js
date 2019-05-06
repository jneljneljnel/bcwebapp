var pdfFiller = require('pdffiller');

var sourcePDF = "cdph2.pdf";

// Override the default field name regex. Default: /FieldName: ([^\n]*)/
var nameRegex = null;
var FDF_data = pdfFiller.generateFDFTemplate( sourcePDF, nameRegex, function(err, fdfData) {
    if (err) throw err;
    console.log(fdfData);
});
