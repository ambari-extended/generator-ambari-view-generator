'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var files = require('fs');
var Handlebars = require('handlebars');
const os = require('os');
var mkdirp = require('mkdirp');


var mapping = {"includeHTML":"simple-html-view","includeSpring":"spring-view","includeServlet":"servlet-view",
              "includeJerseyEmber":"simple-java-ember"};


//Utilities

function copyTemplate(context, which, where,useRealPaths) {
  files.readFile(context.templatePath(which), {encoding: 'utf-8'}, function (err, data){
      if (!err){
        var template = Handlebars.compile(data);
        var data = { "name": context.answers.name, "label": context.answers.label,"version":context.answers.version,
          "min_ambari_version":context.answers.ambariVersion};
        var result = template(data);
        var destination = context.destinationPath(where);
        if(useRealPaths)
            destination = where;
        files.writeFile(destination, result, function(err) {
          if(err) {
            return console.log(err);
          }
              });

          }else{
              console.log(err);
          }

      });
}

function cleanUp(context,destination) {
  console.log("Cleaning up");
  context.fs.delete(destination + "/view.xml.template");
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

  copyTemplate(context,"simple-html-view/view.xml.template",context.answers.name+"/src/main/resources/view.xml");
  // delete the template file
  cleanUp(context,context.destinationPath(context.answers.name));

};

var handleSpring = function(type,context){

  if(type != "spring-view")
    return;

  // copy the view.xml template and update it with information
  // and move it to the view resources folder

  //copy over the directory

  console.log("Creating the " + context.answers.name + " view folder");
  var destination = context.ambariLocation.ambariLocation + "/contrib/views"+"/"+context.answers.name;
  mkdirp(destination);

  context.fs.copy(
      context.templatePath('spring-view/'),
      destination
  );

  copyTemplate(context,"spring-view/view.xml.template",destination+"/src/main/resources/view.xml",true);
  copyTemplate(context,"spring-view/pom.xml",destination+"/pom.xml",true);
  copyTemplate(context,"spring-view/docs/index.md",destination+"/docs/index.md",true);
  // delete the template file
  cleanUp(context,destination);


  //overwrite the pom.xml and doc files

};


var handleServlet = function(type,context){

  if(type != "servlet-view")
    return;

  // copy the view.xml template and update it with information
  // and move it to the view resources folder

  //copy over the directory

  console.log("Creating the " + context.answers.name + " view folder");
  var destination = context.ambariLocation.ambariLocation + "/contrib/views"+"/"+context.answers.name;
  mkdirp(destination);

  context.fs.copy(
      context.templatePath('servlet-view/'),
      destination
  );

  copyTemplate(context,"servlet-view/view.xml.template",destination+"/src/main/resources/view.xml",true);
  copyTemplate(context,"servlet-view/pom.xml",destination+"/pom.xml",true);
  copyTemplate(context,"servlet-view/docs/index.md",destination+"/docs/index.md",true);
  // delete the template file
  cleanUp(context,destination);


};

var handleJavaEmber = function(type,context){

  if(type != "simple-java-ember")
    return;

  // copy the view.xml template and update it with information
  // and move it to the view resources folder

  //copy over the directory

  console.log("Creating the " + context.answers.name + " view folder");

  var destination = context.ambariLocation.ambariLocation + "/contrib/views"+"/"+context.answers.name;
  mkdirp(destination);

  context.fs.copy(
      context.templatePath('simple-java-ember/'),
      destination
  );

  copyTemplate(context,"simple-java-ember/view.xml.template",destination+"/src/main/resources/view.xml",true);
  copyTemplate(context,"simple-java-ember/pom.xml",destination+"/pom.xml",true);
  // delete the template file
  cleanUp(context,destination);


};



var handlers = [handleSimpleHtml,handleSpring,handleServlet,handleJavaEmber];

function isJavaView(answers) {
  return answers.framework === "includeSpring" || answers.framework === "includeSpringEmber"
      || answers.framework === "includeJerseyEmber" || answers.framework === "includeJersey"
      || answers.framework === "includeServlet";
}
module.exports = yeoman.Base.extend({

  prompting: function () {

    console.log(files.readFileSync(this.templatePath("banner.txt"),'utf-8'));


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
          return isJavaView(answers);
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

  ambariExists:function(){
    console.log(process.cwd());
    if(isJavaView(this.answers)) {
      // Ask for the Ambari location on filesystem
      console.log("--------------------------------------------------");
      console.log("Java views can only be developed with dependencies");
      console.log("and need to be built within the Ambari ecosystem");
      console.log("--------------------------------------------------");
      return this.prompt([{
        type: 'confirm',
        name: 'ambariExists',
        message: 'Do you have Ambari set up for development ?',
        default: true // Default to current folder name
      }]).then(function (ambariExists) {
        this.ambariExists = ambariExists;
      }.bind(this));
    }

  },

  ambariOrClone: function(){
    if(isJavaView(this.answers)) {
      if (this.ambariExists.ambariExists) {
        return this.prompt([{
          type: 'input',
          name: 'ambariLocation',
          message: 'Please enter the complete path now',
          default: os.homedir() + "/ambari" // Default to current folder name
        }]).then(function (ambariLocation) {
          this.ambariLocation = ambariLocation;
        }.bind(this));
      } else {
        console.log("--------------------------------------------------");
        console.log("I will clone Ambari in your current directory");
        console.log("---------------------Starting---------------------");
        this.spawnCommandSync('git', ['clone', "https://github.com/apache/ambari.git"]);
        console.log("---------------------Done-------------------------");

        this.ambariLocation = process.cwd() + "/ambari";
      }
    }
  },


  verifyLocalAmbari: function(){
    if(this.ambariExists.ambariExists) {
      // verify the local Ambari installation
      var stats = files.lstatSync(this.ambariLocation.ambariLocation);

      // Is it a directory?
      if (stats.isDirectory()) {
        if(files.lstatSync(this.ambariLocation.ambariLocation+"/contrib/views").isDirectory())
          console.log("--------------------------------------------------");
          console.log("Detected valid Ambari development directory");
          console.log("--------------------------------------------------");
      } else {
        console.log("Please check Ambari path and try again");
        process.exit();

      }
    }

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
