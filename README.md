# Drive It

[Click Here](https://driveit.us-west-2.elasticbeanstalk.com) to access the application.

***Drive It*** is a cloud-based web application, that allows you to store, retrieve and manage files over the cloud. *Drive It* is absolutely free to use, at no cost limit and with no storage limit. *Drive It* is powered by Node.js and Amazon Web Services (AWS).

***Drive It*** strives on file security too. *Drive It* runs on ```https``` with a valid SSL certicate, so no worries about the files you store. Your files will be secure, always.

### Features!
With *Drive It*, you will be able to:
  - Register an account, with a simple registration procedure
  - Login using *One login* feature, that syncs with activities across devices
  - Upload files to the cloud drive
  - Download the files
  - Delete unnecessary files

With a User friendly Interface,
- Designed with Material concepts
- Built with the ideology of 'One page One action'
- Allows Drag and drop file upload
- Supports multiple uploads at the same time
- Impressive rendering of your files collection
- *One click Download* option

### Tech Involved

*Drive It* uses a number of open source projects to work properly:
* [node.js] - evented I/O for the backend
* [Express] - fast node.js network app framework
* [jQuery] - you know that..

*Drive It* is powered by following AWS Services:

* **S3** - Simple Storage Service to store and retrieve files
* **Code Commit** - Git repository to that store the code base
* **Code Build** - Build the code to generatae the artifact
* **Code Deploy** - Service to deploy the application
* **Code Pipeline** - Continuous integration and deployment
* **EC2** - Elastic container service, managing servers for deployment
* **Elastic Beanstalk** - Another service to deploy the application
* **Cognito** - Authentication mechanism based on tokens (JWT & Cookies)
* **Dynamo DB** - To store the user information, and activity logs
* **Lambda** - An automated service that logs the file activity to DB from S3 Bucket

and few other internal services like VPC, IAM, Certificate manager, etc.. to provide a faster, better and efficient service.

### Latest Version
- ##### 2.1.0 

### Upcoming Features!
  - Creating a folder
  - Renaming the files
  - Bulk Download

***Drive It*** is designed and built by [*Jefree Sujit*](http://jefreesjit.github.io).
