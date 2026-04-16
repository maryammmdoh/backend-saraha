/*
    Saraha APP by MongoDB and NodeJS

    Schema:
    User
        _id: ObjectId
        userName: String
        email: String
        password: String
        DOB: Date
        gender: Enum (string)
        confirmEmail: Boolean(default: false)
        createdAt: Datetime
        updatedAt: Datetime

    Message
        _id: ObjectId
        content: String
        senderId: ObjectId (ref to User) (optional)
        receiverId: ObjectId (ref to User)
        createdAt: Datetime
        updatedAt: Datetime


    - We have db.repository.js file that contains all the database operations (CRUD) and we will use it in our services to interact with the database. 
    This will help us to keep our code clean and organized.
    and if we want to change the database in the future, we will only need to change the db.repository.js file and not all the services that interact with the database.

    - response.js file will contain all the response formats that we will use in our controllers to send responses to the client.
    This will help us to keep our code consistent and organized.
    It will contain functions like successResponse, errorResponse, notFoundException, conflictException, etc. that we can use in our controllers to send responses to the client in a consistent format.

    - Hashing Password:
        We will use bcryptjs, bcrypt , argon2 libraries to hash the password before saving it to the database.
        and we will use the same library to compare the hashed password with the plain password when the user tries to login.
        How it works:
            - When the user tries to signup, we will hash the password using bcrypt and save the hashed password to the database.
            - When the user tries to login, we will compare the hashed password with the plain password using bcrypt's compare function. if they match, we will allow the user to login, otherwise we will return an error response.

    - bcryptjs, bcrypt , argon2 are all libraries that provide functions to hash and compare passwords.
    bcryptjs is a pure JavaScript as it low in speed, 
    while bcrypt is a native implementation that uses C++ bindings for better performance, higher speed than bcryptjs. 
    argon2 is a newer hashing algorithm that is designed to be more secure and resistant to attacks than bcrypt.

    - Encrypting phone number:
        We will use crypto library to encrypt the phone number before saving it to the database.
        and we will use the same library to decrypt the phone number when we want to display it to the user.
        How it works:
            - When the user tries to signup, we will encrypt the phone number using crypto and save the encrypted phone number to the database in ciphertext.
            - When we want to display the phone number to the user, we will decrypt the encrypted phone number using crypto's decipher function and display the decrypted phone number to the user.
        we have Asymmetric encryption and Symmetric encryption
        Asymmetric encryption uses a pair of keys, one for encryption and one for decryption. The sender uses the recipient's public key to encrypt the data, and the recipient uses their private key to decrypt it. This method is more secure but slower than symmetric encryption.
        Symmetric encryption uses the same key for both encryption and decryption. The sender and recipient must both have the same key, which can be a security risk if the key is compromised. However, symmetric encryption is faster than asymmetric encryption.
        Tools 
        crypto library in Node.js provides functions for both symmetric and asymmetric encryption. For symmetric encryption, you can use the `crypto.createCipheriv` and `crypto.createDecipheriv` functions. For asymmetric encryption, you can use the `crypto.publicEncrypt` and `crypto.privateDecrypt` functions.
        
    - Hashing vs Encrypting:
        Hashing is a one-way function that converts the input data into a fixed-size string of characters, which is typically a hash value. 
        It is designed to be irreversible, meaning that it is not possible to retrieve the original input data from the hash value. 
        Hashing is commonly used for password storage, where the original password is hashed and stored in the database, and when the user tries to login, the entered password is hashed and compared with the stored hash value.

        Encrypting, on the other hand, is a two-way function that converts the input data into a different format using a specific algorithm and a key. 
        It is designed to be reversible, meaning that it is possible to retrieve the original input data from the encrypted data using the same key. 
        Encrypting is commonly used for sensitive data like phone numbers, where the original data is encrypted and stored in the database, and when we want to display it to the user, we decrypt it using the same key.


        
    Where To Get WEB_CLIENT_ID (Audience ID)

        You get it from Google Cloud Console.

        Step-by-Step

          Go to:
            https://console.cloud.google.com/

          Create / Select Project

            Top left → Select Project
            If none exists → Create New Project

            Select your project (top dropdown)

          Go to:
          APIs & Services → Credentials

          You will see:

          OAuth 2.0 Client IDs

          Click your Web Application credential.
    
    Uploading Files: 3 types of file storage:
        1- Local Storage: where the files are stored on the server's file system. This is the simplest and most common method of file storage, but it can be limited by the server's storage capacity and may not be suitable for large files or high traffic applications.
        To Upload photo locally in the server, we can use multer library, which is a middleware for handling multipart/form-data, which is primarily used for uploading files.
        It makes it easy to handle file uploads in your Express applications. 
        You can configure multer to specify the destination folder for uploaded files, set file size limits, and filter files based on their type. 
        Once a file is uploaded, multer will add a `file` property to the request object, which contains information about the uploaded file, such as its original name, size, and path on the server. 
        You can then use this information to process the file as needed, such as saving it to a database or serving it back to the client.

        local storage can handle file with 
        .single() for single file upload and 
            Example: upload.single('photo') for single file upload with the field name 'photo' in the form data,
        .array() for multiple files upload and 
            Example: upload.array('photos', 5) for multiple files upload with the field name 'photos' in the form data and a maximum of 5 files,
        .fields() for multiple fields with different file names in the same form.
            Example: upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]) for multiple fields with different file names in the same form, where 'avatar' is the field name for a single file upload and 'gallery' is the field name for multiple files upload with a maximum of 8 files.
        maxCount is used to limit the number of files that can be uploaded for a specific field, and it is optional. If not specified, there is no limit on the number of files that can be uploaded for that field.
        

        2- Cloud Storage: where the files are stored on a cloud storage service like Amazon S3, Google Cloud Storage, or Microsoft Azure Blob Storage. This method is more scalable and can handle large files and high traffic applications, but it may require additional setup and configuration.
        To Upload photo to cloud storage, we can use the SDK provided by the cloud storage service, such as the AWS SDK for Amazon S3 or the Google Cloud Storage client library for Node.js. 
        These libraries provide functions for uploading files to the cloud storage service, as well as managing and retrieving files from the storage.

        3- Database Storage: where the files are stored directly in the database as binary data. This method can be convenient for small files and can simplify the application architecture, but it may not be suitable for large files or high traffic applications due to performance issues.
        To Upload photo to database storage, we can use the database's binary data type to store the file data directly in the database. 
        For example, in MongoDB, you can use the GridFS specification to store and retrieve large files in the database. 
        This allows you to store files that exceed the maximum document size limit of MongoDB and provides efficient streaming of file data.

        Mainly, the choice of file storage method depends on the specific requirements of your application, such as the expected file size, traffic volume, and scalability needs.
    To install multer library, you can run the following command in your terminal:
        npm install multer



*/
