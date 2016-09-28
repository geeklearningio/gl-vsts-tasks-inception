import path = require('path');
import fs = require('fs-extra');
import tl = require('vsts-task-lib/task');
import restClient = require('node-rest-client');
import vstsApi = require('./common/vstsApi');
import XRegExp = require('xregexp');

var client = new restClient.Client();

var varRegex = /\$\((.*?)\)/g;

function expandVariable(str: string) {
    return str.replace(varRegex, (match, varName, offset, string) => tl.getVariable(varName));
}

export function parseParameters(map: string): { [tag: string]: string } {
    var result: { [tag: string]: string } = {};

    XRegExp.forEach(map, XRegExp('^\\s*(?<key>.*?)\\s*=>\\s*"(?<val>.*?)"\\s*?$', 'gm'), (match) => {
        result[(<any>match).key] = (<any>match).val;
    });

    return result;
}

var systemAccessToken = vstsApi.getSystemAccessToken(); //tl.getVariable('SYSTEM_ACCESSTOKEN')
var systemUrl = vstsApi.getSystemEndpoint(); // tl.getVariable('SYSTEM_TEAMFOUNDATIONCOLLECTIONURI')

tl.debug("gl : Selected Build Definition : " + tl.getInput('BuildDefinition'));

var buildDefinitionId = tl.getInput('BuildDefinitionSelectionMode') == "Id" ? parseInt(tl.getInput('BuildDefinitionId')) : parseInt(tl.getInput('BuildDefinition'));
var buildParameters = JSON.stringify(parseParameters(expandVariable(tl.getInput('BuildParameters'))));
var ignoreWarnings = tl.getBoolInput('IgnoreWarnings');

var sourceBranch = tl.getVariable('BUILD_SOURCEBRANCH')

var uri = systemUrl +
    tl.getVariable('SYSTEM_TEAMPROJECTID') +
    '/_apis/build/builds?ignoreWarnings=' + (ignoreWarnings ? 'true' : 'false');


var req = client.post(uri, {
    data: {
        definition: {
            id: buildDefinitionId
        },
        parameters: buildParameters,
        sourceBranch: sourceBranch
    },
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + systemAccessToken,
        "Accept": "application/json;api-version=2.0"
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