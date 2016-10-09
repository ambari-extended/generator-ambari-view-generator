'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var files = require('fs');
var Handlebars = require('handlebars');


var mapping = {"includeHTML":"simple-html-view","includeSpring":"spring-view","includeServlet":"servlet-view"};


//Utilities

function copyTemplate(context, which, where) {
  files.readFile(context.templatePath(which), {encoding: 'utf-8'}, function (err, data){
      if (!err){
        var template = Handlebars.compile(data);
        var data = { "name": context.answers.name, "label": context.answers.label,"version":context.answers.version,
          "min_ambari_version":context.answers.ambariVersion};
        var result = template(data);

        files.writeFile(context.destinationPath(where), result, function(err) {
          if(err) {
            return console.log(err);
          }
              });

          }else{
              console.log(err);
          }

      });
}

function cleanUp(context) {
  console.log("Cleaning up");
  context.fs.delete(context.destinationPath(context.answers.name) + "/view.xml.template");
}
var handleSimpleHtml = function(type,context){

  if(type != "simple-html-view")
      return;

  // copy the view.xml template and update it with information
  // and move it to the view resources folder

  //copy over the directory

  console.log("Creating the " + context.answers.name + " view folder");

  context.fs.copy(
      context.templatePath('simple-html-view/'),
      context.destinationPath(context.answers.name)
  );

  // delete the template file
  cleanUp(context);
  copyTemplate(context,"simple-html-view/view.xml.template",context.answers.name+"/src/main/resources/view.xml");

};

var handleSpring = function(type,context){

  if(type != "spring-view")
    return;

  // copy the view.xml template and update it with information
  // and move it to the view resources folder

  //copy over the directory

  console.log("Creating the " + context.answers.name + " view folder");

  context.fs.copy(
      context.templatePath('spring-view'),
      context.destinationPath(context.answers.name)
  );

  // delete the template file
  cleanUp(context);
  copyTemplate(context,"spring-view/view.xml.template",context.answers.name+"/src/main/resources/view.xml");
  copyTemplate(context,"spring-view/pom.xml",context.answers.name+"/pom.xml");
  copyTemplate(context,"spring-view/docs/index.md",context.answers.name+"/docs/index.md");


  //overwrite the pom.xml and doc files

};


var handleServlet = function(type,context){

  if(type != "servlet-view")
    return;

  // copy the view.xml template and update it with information
  // and move it to the view resources folder

  //copy over the directory

  console.log("Creating the " + context.answers.name + " view folder");

  context.fs.copy(
      context.templatePath('servlet-view'),
      context.destinationPath(context.answers.name)
  );

  // delete the template file
  cleanUp(context);
  copyTemplate(context,"servlet-view/view.xml.template",context.answers.name+"/src/main/resources/view.xml");
  copyTemplate(context,"servlet-view/pom.xml",context.answers.name+"/pom.xml");
  copyTemplate(context,"servlet-view/docs/index.md",context.answers.name+"/docs/index.md");


};



var handlers = [handleSimpleHtml,handleSpring];

module.exports = yeoman.Base.extend({
  prompting: function () {
    return this.prompt([{
      type    : 'input',
      name    : 'name',
      message : 'What do you want to call the view',
      default : this.appname // Default to current folder name
    },{
      type    : 'input',
      name    : 'label',
      message : 'What name would you want Ambari to show this view as',
      default : this.appname // Default to current folder name
    },{
      type    : 'input',
      name    : 'version',
      message : 'You can add a version number for your view',
      default : '1.0.0' // Default to 1.0.0
    },{
      type    : 'input',
      name    : 'ambariVersion',
      message : 'Whats the minimum version of Ambari this view will support',
      default : '2.4.0' // Default to 2.4.0
    }, {
      type: 'list',
      name: 'framework',
      message: 'Which framework do you want ?',
      choices: [{
        name: 'Spring',
        value: 'includeSpring'
      },{
        name: 'Spring with EmberJS',
        value: 'includeSpringEmber'
      },{
        name: 'Jersey',
        value: 'includeJersey'
      },{
        name: 'Jersey with EmberJS',
        value: 'includeJerseyEmber'
      },{
        name: 'Plain old Java servlet',
        value: 'includeServlet'
      },{
        name: 'Basic HTML',
        value: 'includeHTML'
      }]
      ,default: 1
    },
      {
        when: function (answers) {
          return answers.framework === "includeSpring" || answers.framework === "includeSpringEmber"
              || answers.framework === "includeJerseyEmber" || answers.framework === "includeJersey"
              || answers.framework === "includeServlet";
        },
        type: 'checkbox',
        name: 'libraries',
        message: 'Which HDP libraries do you want',
        choices: [{
          name: 'Hadoop',
          value: 'includeHdp',
          checked: false
        }, {
          name: 'Hive',
          value: 'includeHive',
          checked: false
        }, {
          name: 'Pig',
          value: 'includePig',
          checked: false
        }]
      },
      {
        when: function (answers) {
          if(!answers.libraries) return false;
          return answers.libraries.indexOf("includeHdp") > -1;
        },
        type    : 'input',
        name    : 'hdpVersion',
        message : 'What version of Hadoop do you want ',
        default : '2.7.1'
      },
      {
        when: function (answers) {
          if(!answers.libraries) return false;
          return answers.libraries.indexOf("includeHive") > -1;
        },
        type    : 'input',
        name    : 'hiveVersion',
        message : 'What version of Hive do you want ',
        default : '2.7.1'
      },
      {
        when: function (answers) {
          if(!answers.libraries) return false;
          return answers.libraries.indexOf("includePig") > -1;
        },
        type    : 'input',
        name    : 'pigVersion',
        message : 'What version of Pig do you want ',
        default : '2.7.1'
      }
    ]).then(function (answers) {
      this.answers = answers;
    }.bind(this));
  },

  writing: function () {

    var fw = mapping[this.answers.framework];
    var context = this;
    if(fw) {
      handlers.forEach(function (it) {
        it(fw, context);
      });
    } else {
      console.log("Ember is not supported yet");
    }

  },


  install: function () {
    if(this.answers.framework === "includeSpringEmber"
        || this.answers.framework === "includeJerseyEmber") {
      // Not implemented yet
      return;
      this.installDependencies();
    }
  }
});
