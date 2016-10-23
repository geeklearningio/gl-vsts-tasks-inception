![Icon](https://github.com/geeklearningio/gl-vsts-tasks-inception/blob/master/Extension/extension-icon.png)

# Team Services Build and Release Tasks

![cistatus](https://geeklearning.visualstudio.com/_apis/public/build/definitions/f841b266-7595-4d01-9ee1-4864cf65aa73/57/badge)

Visual Studio Team Services Build and Release Management extensions which allow it to take control over himself.

[Learn more](https://github.com/geeklearningio/gl-vsts-tasks-inception/wiki) about this extension on the wiki!

## Tasks included

* **[Queue a Build](https://github.com/geeklearningio/gl-vsts-tasks-inception/wiki/Queue-Build)**: Queues a build

## To contribute

1. Globally install typescript and tfx-cli (to package VSTS extensions): `npm install -g typescript tfx-cli`
2. From the root of the repo run `npm install`. This will pull down the necessary modules for the different tasks and for the build tools.
3. Run `npm run build` to compile the build tasks.
4. Run `npm run package -- --version <version>` to create the .vsix extension packages (supports multiple environments) that includes the build tasks.

## Release Notes

> **23-10-2016**
> - [QueueBuild] Add Source branch to build options #10 
> - [QueueBuild] Fixed a casing issue when requiring VSSEXTENSION endpoint causing errors on some environement.

## Contributors

This extension was created by [Geek Learning](http://geeklearning.io/), with help from the community.

## Attributions

* [Top by Mr Blune from the Noun Project](https://thenounproject.com/term/inception/22598/)