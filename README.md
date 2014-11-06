I've created this repo to help test and understand the differences between uploading files to S3 as a single file versus multipart file.

## Usage

* Create a new IAM user that only has access to S3

* Create a new S3 bucket that we can use for testing

* Configure CORS on the new bucket

        <CORSConfiguration>
            <CORSRule>
                <AllowedOrigin>*</AllowedOrigin>
                <AllowedMethod>HEAD</AllowedMethod>
                <AllowedMethod>GET</AllowedMethod>
                <AllowedMethod>PUT</AllowedMethod>
                <AllowedMethod>POST</AllowedMethod>
                <AllowedMethod>DELETE</AllowedMethod>
                <AllowedHeader>*</AllowedHeader>
                <ExposeHeader>ETag</ExposeHeader>
                <ExposeHeader>x-amz-meta-custom-header</ExposeHeader>
                <MaxAgeSeconds>3000</MaxAgeSeconds>
            </CORSRule>
        </CORSConfiguration>

* Create a file named aws-config.js in javascript and set the following configuration options:

        window.awsAccessKeyId = 'your-iam-user-access-key';
        window.awsSecretAccessKey = 'your-iam-user-secret-key';
        window.awsRegion = 'your-aws-region';
        window.awsS3Bucket = 'your-new-s3-bucket';

* Open s3-upload-test.html in a browser

* Upload a file and observe the time taken

* You'll currently need to switch between s3-upload.js and s3-upload-multipart.js

## Potentially useful links

* [Multipart Upload Overview](http://docs.aws.amazon.com/AmazonS3/latest/dev/mpuoverview.html)
* https://enzam.wordpress.com/2013/05/13/upload-to-amazon-s3-server-directly-from-browser-in-chunk-and-resumable-way/
* https://github.com/ienzam/s3-multipart-upload-browser
* [AWS JS SDK](https://github.com/aws/aws-sdk-js)
* [EvaporateJS](https://github.com/TTLabs/EvaporateJS)
* [EvaporateJS issue about using the official JS SDK](https://github.com/TTLabs/EvaporateJS/issues/52)
