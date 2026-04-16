/*
    In this file we will explain the ways of deployments and the best practices for deploying a Node.js application.

    Deployment is the process of making your application available to users by hosting it on a server. There are several ways to deploy a Node.js application, and the best method depends on your specific requirements, budget, and technical expertise. Here are some common deployment options for Node.js applications:
    
    Types of Deployments:
    Vercel: Vercel is a cloud platform that provides a seamless deployment experience for Node.js applications. It offers features like automatic scaling, serverless functions, and easy integration with GitHub for continuous deployment. Vercel is ideal for frontend applications and serverless APIs.
    AWS: Amazon Web Services (AWS) offers a wide range of services for deploying Node.js applications, including Elastic Beanstalk, Lambda, and EC2. AWS provides scalability, reliability, and a global infrastructure, making it suitable for applications of all sizes.
    Render: Render is a cloud platform that simplifies the deployment of Node.js applications. It offers features like automatic scaling, zero-downtime deployments, and easy integration with GitHub. Render is a good choice for developers looking for a straightforward deployment solution.

    we will begin with AWS deployment as it is the most widely used and versatile option for deploying Node.js applications, and it provides a comprehensive set of tools and services that can accommodate a wide range of application requirements and scales, making it suitable for both small projects and large enterprise applications.
    many complex configuration and setup are required for AWS deployment, but it provides a high level of control and customization over the deployment process, allowing you to optimize your application for performance, security, and scalability. Additionally, AWS offers a free tier that allows you to experiment with their services without incurring costs, making it an attractive option for developers looking to deploy their Node.js applications in the cloud.

    Deployment Plan:
    1- Connect with DB cloud provider (e.g., MongoDB Atlas) and set up the database connection in your application, this will allow you to store and manage your application's data in the cloud, providing scalability, reliability, and security for your database.
    2- upload the code to a cloud provider like GitHub repository, this will allow you to easily manage your code and collaborate with other developers, and it also provides a convenient way to integrate with deployment platforms like Vercel and Render for continuous deployment.
    3- config AWS connection
    4- connect token with AWS to access from my machine and set up environment variables in AWS for your application, this will allow you to securely manage sensitive information like API keys and database credentials, and it also enables you to easily update these values without having to modify your code.
    6- config machine --> install node js and npm and set up the environment for your application, this will ensure that your application has the necessary runtime and dependencies to run correctly on the server.
                    --> clone the code from the repository to the server, this will allow you to deploy your application on the server and make it accessible to users.
                    --> run npm install to install the dependencies for your application, this will ensure that all the required libraries and packages are available for your application to function properly.
                    --> run pm2 start to start your application using PM2, which is a process manager for Node.js applications that allows you to keep your application running in the background, manage multiple instances, and automatically restart it if it crashes, ensuring high availability and reliability for your application.

    step1: Connect with DB cloud provider (e.g., MongoDB Atlas) and set up the database connection in your application, this will allow you to store and manage your application's data in the cloud, providing scalability, reliability, and security for your database.
        first    
            - go to MongoDB Atlas and create a new cluster, then create a new database and collection for your application, and finally get the connection string for your database and update your application's database connection configuration with the new connection string.
            - add in .env file the new connection string for MongoDB Atlas and update the DB_ATLAS_URL variable in your config.service.js file to use the new connection string.
            - modify the config.service.js file to include the new DB_ATLAS_URL variable and use it in the connection.js file to connect to the MongoDB Atlas database instead of the local MongoDB instance.    
            - update the connection.js file to use the DB_ATLAS_URL variable for connecting to the database instead of the local DB_URL variable.
        second
            - .gitignore file should be updated to include the .env file to prevent it from being committed to the repository, this is important for security reasons to ensure that sensitive information like database connection strings and API keys are not exposed in the codebase.
                like node_modules/
                    /config/.env*
                    /uploads/
    
    step2: upload the code to a cloud provider like GitHub repository, this will allow you to easily manage your code and collaborate with other developers, and it also provides a convenient way to integrate with deployment platforms like Vercel and Render for continuous deployment.
        - create a new repository on GitHub and push your code to the repository, this will allow you to manage your code and collaborate with other developers, and it also provides a convenient way to integrate with deployment platforms like Vercel and Render for continuous deployment.
            - git init
            - git add .
            - git commit -m "Initial commit"
            - git remote add origin <repository_url>
            - git push -u origin master
    
    step3: config AWS connection
        redotpay --> virtual cridet card --> get the card details (card number, expiration date, CVV) and use them to set up your AWS account for deployment, this will allow you to access AWS services and deploy your application on the AWS infrastructure.
        - create an AWS account and set up the necessary permissions and roles for deploying your application, this will ensure that you have the appropriate access to AWS services and resources needed for your deployment.
        - we will use EC2 (Elastic Compute Cloud) to deploy our application, so we need to create an EC2 instance and configure it with the necessary settings (e.g., instance type, security groups, key pairs) to host our Node.js application on AWS.
        - lanch instance
            name: saraha-app-server
            os: ubuntu 22.04
            free tier eligible
            Architecture: x86
            instance type: t3.small
            key pair: create a new key pair and download the private key file (.pem) to your local machine, this will be used to securely connect to your EC2 instance via SSH for managing and deploying your application.
            Allow SSH traffic in the security group settings to enable remote access to your EC2 instance for deployment and management purposes. --> Anywhere
            Allow HTTP traffic in the security group settings to enable access to your Node.js application from the web. --> Anywhere
            Allow HTTPS traffic in the security group settings to enable secure access to your Node.js application from the web. --> Anywhere
            then launch the instance and wait for it to be running before proceeding to the next steps of deployment.

            return to the EC2 dashboard and select your instance, 
            then allocate an Elastic IP address and associate it with your instance to ensure a static IP for your application and give it a meaningful name,
            then click on the "Connect" button to get the SSH connection details (e.g., public IP address, username) needed to connect to your EC2 instance for deployment and management of your Node.js application.

    step4: connect token with AWS to access from my machine and set up environment variables in AWS for your application, this will allow you to securely manage sensitive information like API keys and database credentials, and it also enables you to easily update these values without having to modify your code.
        - connect to your EC2 instance via SSH using the provided connection details and the private key file (.pem) you downloaded earlier, this will allow you to securely access your EC2 instance for managing and deploying your Node.js application.
            - open a terminal and navigate to the directory where your private key file (.pem) is located, then run the following command to connect to your EC2 instance via SSH:
                ssh -i your-key-file.pem ubuntu@your-ec2-public-ip
        
    step5: config machine:
        sudo apt update && sudo apt upgrade -y --> to update the package lists and upgrade the installed packages on your EC2 instance, this will ensure that your server has the latest security patches and software updates before deploying your application.
        curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash - --> to add the NodeSource APT repository to your EC2 instance and install Node.js version 18, this will provide the necessary runtime for your Node.js application to run on the server.
                ctrl + l --> to clear the terminal screen for better readability after installing Node.js.
        sudo apt install -y nodejs --> to install Node.js on your EC2 instance, this will allow you to run your Node.js application on the server.
        node -v --> to verify that Node.js has been installed correctly by checking its version, this will confirm that the installation was successful and that you have the correct version of Node.js for your application.
        npm -v --> to verify that npm (Node Package Manager) has been installed correctly by checking its version, this will confirm that the installation was successful and that you have the necessary tools to manage your application's dependencies.
        sudo apt install -y git --> to install Git on your EC2 instance, this will allow you to clone your application's code from a Git repository (e.g., GitHub) for deployment.
        git clone <repository_url> --> to clone your application's code from the specified Git repository to your EC2 instance, this will allow you to deploy your application on the server and make it accessible to users.
        ls --> to list the contents of the current directory and verify that your application's code has been successfully cloned to the EC2 instance, this will confirm that you have the necessary files for deployment.
        cd your-repository-name --> to navigate into the directory of your cloned application code, this will allow you to manage and deploy your application from the correct location on the server.
        cd config --> to navigate into the config directory of your application, this is where you will set up your environment variables for the application to use during deployment. 
        nano .env.dev --> to create and edit the .env.dev file on your EC2 instance, this will allow you to set up environment variables for your application, such as database connection strings and API keys, which are essential for the application's configuration and security.
        nano .env.prod --> to create and edit the .env.prod file on your EC2 instance, this will allow you to set up environment variables specifically for the production environment, ensuring that your application is configured correctly for deployment and can securely manage sensitive information like database credentials and API keys in a production setting.
        ls -a --> to list all files in the current directory, including hidden files like .env.dev and .env.prod, this will allow you to verify that your environment variable files have been created successfully on the EC2 instance for your application's configuration.
        cd .. --> to navigate back to the root directory of your application, this will allow you to manage and deploy your application from the correct location on the server.
        npm install --> to install the dependencies for your application as specified in the package.json file, this will ensure that all the required libraries and packages are available for your application to function properly on the EC2 instance.
        npm run start:dev --> to start your application in development mode, this will allow you to test and verify that your application is running correctly on the EC2 instance before deploying it in production mode.
        sudo apt install nginx -y --> to install Nginx on your EC2 instance, this will allow you to set up a reverse proxy for your Node.js application, enabling you to serve your application on standard HTTP/HTTPS ports and improve performance and security.
        sudo nano /etc/nginx/sites-available/default --> to edit the default Nginx configuration file, this will allow you to configure Nginx as a reverse proxy for your Node.js application, enabling you to serve your application on standard HTTP/HTTPS ports and improve performance and security.
        sudo systemctl restart nginx --> to restart the Nginx service and apply the new configuration, this will ensure that your Node.js application is now being served through Nginx as a reverse proxy, allowing users to access it via standard HTTP/HTTPS
                in the Nginx configuration file, you will need to set up a server block that listens on the desired port (e.g., 80 for HTTP) and proxies requests to your Node.js application running on a specific port (e.g., 3000). This typically involves adding a location block that uses the proxy_pass directive to forward requests to your Node.js application's port, along with any necessary headers for proper request handling. After configuring Nginx, restarting the service will apply the changes and allow users to access your Node.js application through the configured domain or IP address.
                server {
                    listen 80 default_server;
                    listen [::]:80 default_server;
                    location / {
                        proxy_pass http://localhost:3000; # Assuming your Node.js app is running on port 3000
                        proxy_http_version 1.1;
                        proxy_set_header Upgrade $http_upgrade;
                        proxy_set_header Connection 'upgrade';
                        proxy_set_header Host $host;
                        proxy_cache_bypass $http_upgrade;
                    }
                }
        sudo nginx -t --> to test the Nginx configuration for syntax errors, this will help ensure that your Nginx configuration is correct and will not cause issues when restarting the service.
        sudo systemctl restart nginx --> to restart the Nginx service and apply the new configuration, this will ensure that your Node.js application is now being served through Nginx as a reverse proxy, allowing users to access it via standard HTTP/HTTPS ports.
        npm run start:dev --> to start your application in development mode, this will allow you to test and verify that your application is running correctly on the EC2 instance before deploying it in production mode.
*/