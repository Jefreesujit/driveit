var path = require('path');
var fs = require('fs');

module.exports = function (app) {
    app.get('/certupload', function(req,res) {
        res.sendFile(path.join(__dirname, 'public', 'certupload.html'));   
    });
    
    app.get('/.well-known/acme-challenge/:id', function(req,res) {
        res.sendFile(path.join(__dirname, '.cert-files', req.params.id));
    });
    
    app.post('/cert/upload', function (req, res) {
    var file = req.files.file;
    fs.readFile(file.path, 'utf8', function (err, data) {
        fs.writeFile(".cert-files/" + file.name, data, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
        res.status(200).send(true);
        }); 
    });
    });
}
