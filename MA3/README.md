This project was bootstrapped with [DHIS2 Application Platform](https://github.com/dhis2/app-platform).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner and runs all available tests found in `/src`.<br />

See the section about [running tests](https://platform.dhis2.nu/#/scripts/test) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
A deployable `.zip` file can be found in `build/bundle`!

See the section about [building](https://platform.dhis2.nu/#/scripts/build) for more information.

### `yarn deploy`

Deploys the built app in the `build` folder to a running DHIS2 instance.<br />
This command will prompt you to enter a server URL as well as the username and password of a DHIS2 user with the App Management authority.<br/>
You must run `yarn build` before running `yarn deploy`.<br />

See the section about [deploying](https://platform.dhis2.nu/#/scripts/deploy) for more information.

## Learn More

You can learn more about the platform in the [DHIS2 Application Platform Documentation](https://platform.dhis2.nu/).

You can learn more about the runtime in the [DHIS2 Application Runtime Documentation](https://runtime.dhis2.nu/).

To learn React, check out the [React documentation](https://reactjs.org/).

## DHIS2 Training Environment

This project targets the DHIS2 course environment described in the official tutorials:

- [DHIS2 instance overview](https://dhis2-app-course.ifi.uio.no/learn/dhis2/getting-started/development-environment/dhis2-instance/)
- [Development environment overview](https://dhis2-app-course.ifi.uio.no/learn/dhis2/getting-started/development-environment/)
- [Local development setup guide](https://dhis2-app-course.ifi.uio.no/learn/dhis2/getting-started/development-environment/development-env-setup/)
- [Project code walkthrough](https://dhis2-app-course.ifi.uio.no/learn/dhis2/getting-started/development-environment/project-code/)

Follow the steps in the tutorials to start the DHIS2 portal, then sign in with:

- **Username:** `admin`
- **Password:** `district`

Launching the training portal and logging in with the credentials above is required before the app can fetch datasets or submit values during development.

## How to Run

1. Install dependencies: `yarn install`
2. Start the training portal in a separate terminal: `npx dhis-portal --target=https://data.research.dhis2.org/in5320/`
3. Start the development server: `yarn start`
4. (Optional) Run tests: `yarn test`
5. Build a production bundle: `yarn build`
6. Deploy the bundle to a DHIS2 instance: `yarn deploy` (requires a running instance and credentials)
