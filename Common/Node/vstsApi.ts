import tl = require('vsts-task-lib/task');

export function getSystemEndpoint(): string{
    return tl.getEndpointUrl("SYSTEMVSSCONNECTION", false);
}

export function getSystemAccessToken(): string {
    tl.debug('Getting credentials for local feeds');
    var auth = tl.getEndpointAuthorization('SYSTEMVSSCONNECTION', false);
    if (auth.scheme == 'OAuth') {
        tl.debug("Got auth token")
        return auth.parameters['AccessToken'];
    }
    else {
        tl.warning('Could not determine credentials to use for NuGet');
    }
}