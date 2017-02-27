import path = require('path');
import fs = require('fs-extra');
import tl = require('vsts-task-lib/task');
import restClient = require('node-rest-client');
import vstsApi = require('./common/vstsApi');
import XRegExp = require('xregexp');

var client = <restClient.Client>new (<any>restClient.Client)({
    mimetypes: {
        json: [
            'application/json',
            'application/json; charset=utf-8',
            'application/json; charset=utf-8; api-version=2.0',
            'application/json; charset=utf-8; api-version=3.0-preview.2'
        ]
    }
});

var varRegex = /\$\((.*?)\)/g;
var currentBuild = tl.getVariable('System.DefinitionId');

if (currentBuild) {
    tl.debug('Current Build Definition Id : ' + currentBuild.toString());
}

function expandVariable(str: string) {
    return str.replace(varRegex, (match, varName, offset, string) => tl.getVariable(varName));
}

export function parseParameters(map: string): { [tag: string]: string } {
    var result: { [tag: string]: string } = {};

    XRegExp.forEach(map, XRegExp('^\\s*(?<key>.*?)\\s*=>\\s*"?(?<val>.*?)"?\\s*?$', 'gm'), (match) => {
        result[(<any>match).key] = (<any>match).val;
    });

    return result;
}

var systemAccessToken = vstsApi.getSystemAccessToken(); //tl.getVariable('SYSTEM_ACCESSTOKEN')
var systemUrl = vstsApi.getSystemEndpoint(); // tl.getVariable('SYSTEM_TEAMFOUNDATIONCOLLECTIONURI')

tl.debug("system Url : " + systemUrl);
tl.debug("SYSTEM_TEAMFOUNDATIONCOLLECTIONURI : " + tl.getVariable('SYSTEM_TEAMFOUNDATIONCOLLECTIONURI'));
tl.debug("system.teamFoundationCollectionUri : " + tl.getVariable('system.teamFoundationCollectionUri'));

tl.debug("gl : Selected Build Definition : " + tl.getInput('BuildDefinition'));

var buildDefinitionId = tl.getInput('BuildDefinitionSelectionMode') == "Id" ? parseInt(tl.getInput('BuildDefinitionId')) : parseInt(tl.getInput('BuildDefinition'));
var buildParameters = JSON.stringify(parseParameters(expandVariable(tl.getInput('BuildParameters'))));
var ignoreWarnings = tl.getBoolInput('IgnoreWarnings');

var sourceBranch = tl.getVariable('BUILD_SOURCEBRANCH')

var targetSourceBranch = tl.getInput('TargetSourceBranch');

if (targetSourceBranch) {
    sourceBranch = targetSourceBranch;
}

if (currentBuild && (parseInt(currentBuild) == buildDefinitionId)) {
    tl.setResult(tl.TaskResult.Failed, 'Auto queuing a build is disabled');
} else {
    var uri = systemUrl +
        tl.getVariable('SYSTEM_TEAMPROJECTID') +
        '/_apis/build/builds?ignoreWarnings=' + (ignoreWarnings ? 'true' : 'false');

    tl.debug(buildParameters);

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

        tl.debug(response.statusCode);
        tl.debug(data);

        try {
            var parsedData = JSON.parse(data);
            if (response.statusCode == 200) {
                tl.setResult(tl.TaskResult.Succeeded, 'Build queued successfully : ' + parsedData._links.web.href);
            } else {
                tl.setResult(tl.TaskResult.Failed, 'Failed to queue the build with message : ' + parsedData.message);
            }
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, 'Failed to queue the build : Cannot read parse response');
        }
    });

    req.on('error', function (err: any) {
        console.log('request error', err);
        tl.setResult(tl.TaskResult.Failed, 'Failed to queue the build');
    });
}

