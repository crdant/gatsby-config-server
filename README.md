# Gatsby Spring Cloud Config Demo

Demonstrates the use of Spring Cloud Config Server with a statically generated site. Uses
[GatsbyJS](https://www.gatsbyjs.org) and a [source plugin](https://www.npmjs.com/package/gatsby-source-spring-cloud-config)
([github](https://github.com/crdant/gatsby-source-spring-cloud-config)) that reads from the config sever. Deploy to
[Pivotal Cloud Foundry](https://pivotal.io/platform) using the
[NodeJS buildpack](https://docs.cloudfoundry.org/buildpacks/node/index.html) for building the site and the
[Staticfile buildpack](https://docs.cloudfoundry.org/buildpacks/staticfile/index.html) to see the demonstration.


## Prepraing the configuration repository

You'll need a config repository with an `application.yml` containing a site description with a
title and background color, as below.

```yaml
site:
  title: Gatsby Spring Cloud Config Demonstration
  header:
    background: "#008774"
```

You can use [my demo repository](https://github.com/crdant/gatsby-config) to see the example in action, but to make changes
you'll want to fork that repo or create your own.


## Deploying to Pivotal Cloud Foundry

Create a config server using the [Spring Cloud Services](https://network.pivotal.io/products/p-spring-cloud-services) config server option
from the services marketplace. The examples below are for [Pivotal Web Services](https://run.pivotal.io),
service and/or service plan names may vary in your environment.

```sh
cf create-service p-config-server trial gatsby-spring-cloud
```

The file `config.json` can be used to configure the instance to point to my demo respository,
or update it for your needs.

```sh
cf update-service gatsbyjs-config-server -c ./config.json
```

The service will be bound to your app on deployment since it's specified in `manifest.yml`.

To deploy, run

```sh
npm run deploy
```

which will deploy your bits using the [NodeJS buildpack](https://docs.cloudfoundry.org/buildpacks/node/index.html) then add the
[Staticfile buildpack](https://docs.cloudfoundry.org/buildpacks/staticfile/index.html) to the mix to serve the static site.

### What's happening when you deploy

The deploy script first deploys the application using the `manifest.yml` to specify names,
routes, etc. and using the `nodejs_buildpack` which is specified on the command-line to clarify
what's going on. On this push, it doesn't start the application yet, since it needs to add
the `staticfile_buildpack` to the mix to serve the site.

```sh
cf push --no-start -b nodejs_buildpack
```

it then pushes the application using the [V3 API](http://v3-apidocs.cloudfoundry.org/version/3.51.0/index.html) so that it can use multiple buildpacks.

```sh
cf v3-push -b nodejs_buildpack -b staticfile_buildpack gatsby-spring-cloud
```

During the second push, the application is started. Since we specify a command in `Procfile`
that command is used instead of the default start command. We use the custom start script
to build the static site before serving it up. The start command is:

```sh
export PATH=$HOME/app/node_modules/.bin:$HOME/deps/0/bin:${PATH} && gatsby build && $HOME/boot.sh
```

which sets up the `PATH` for the Gatsby CLI, builds the site, and starts `nginx` using the
standard start mechanism for the [Staticfile buildpack](https://docs.cloudfoundry.org/buildpacks/staticfile/index.html).

### Changing the configuration

You will need to have your own server to change the configuration. If you're using my repository,
the simplest way to make changes it fork the repo, then update your config server by replacing the
repository name in `config.json`

```javascript
{
	"count": 1,
	"git": {
		"uri": "<YOUR FORKED REPO HERE>"
	}
}
```

then update your config Server

```sh
cf update-service gatsbyjs-config-server -c ./config.json
```

Once you're using your own repository, you can change `application.yml` and reflect your changes
by restarting the app using `cf restart`. Restarting will execute the custom start command and  
re-execute the site build.

## Working locally

Make sure that you have the Gatsby CLI program installed:
```sh
npm install --global gatsby-cli
```

You'll also need to run a copy of the [Spring Cloud Config Server](https://github.com/spring-cloud/spring-cloud-config) and point it to your
config repository.

Once you've got a config server running, run the site locally with

```sh
gatsby develop
```

From here, interact with it for local development, build, and serving as you would
any other [GatsbyJS](https://www.gatsbyjs.org) site.
