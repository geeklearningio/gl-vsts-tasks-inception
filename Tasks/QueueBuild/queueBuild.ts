import path = require('path');
import fs = require('fs-extra');
import tl = require('vsts-task-lib/task');
import restClient = require('node-rest-client');

var client = new restClient.Client();

var varRegex = /\$\((.*?)\)/g;

function expandVariable(str: string){
    return str.replace(varRegex, (match, varName, offset, string) => tl.getVariable(varName));
}

var uri = tl.getVariable('SYSTEM_TEAMFOUNDATIONCOLLECTIONURI') +
    tl.getVariable('SYSTEM_TEAMPROJECTID') +
    '/_apis/build/builds?ignoreWarnings=true';

var buildId = parseInt(tl.getInput('BuildId'));
var buildParameters = expandVariable(tl.getInput('BuildParameters'));

var sourceBranch = tl.getVariable('BUILD_SOURCEBRANCH')

var req = client.post(uri, {
    data: {
        definition: {
            id: buildId
        },
        parameters: buildParameters,
        sourceBranch: sourceBranch
    },
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tl.getVariable('SYSTEM_ACCESSTOKEN'),
        "Accept" : "application/json;api-version=2.2"
    }
}, function (data, response) {
    // parsed response body as js object
    console.log(data);
    // raw response
    //console.log(response);
    tl.setResult(tl.TaskResult.Succeeded, 'Build queued successfully');
});

req.on('error', function (err: any) {
    console.log('request error', err);
    tl.setResult(tl.TaskResult.Failed, 'Failed to queue the build');
});