import tl = require('vsts-task-lib/task');

var ccp = new tl.CodeCoveragePublisher();
ccp.publish(codeCoverageTool, summaryFileLocation, reportDirectory, codeCoverageFiles);