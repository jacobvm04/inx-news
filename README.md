# inx-news
A REST API clone of Hacker New's backend REST API that uses node.js, express, and postgres.

## Routes
### Register
`POST /users/register`
Please use the following json format for the body:
```
{
  username: "johndoe",
  password: "password"
}
```
A successful response will contain a message and a representation of the user registered, all in json.

### Login
`POST /users/login`
Please use the following json format for the body:
```
{
  username: string,
  password: string
}
```
A successful response will contain a JWT token.

### Get all submissions
`GET /submissions`
A successful response will contain a json array of the 10 most popular submissions, in descending order.

### Get a specific submission
`GET /submission/:id`
A successful response will contain a json respresentation submission with the supplied ID.

### Comment on a submission
`POST /submission/:id`
Please use the bearer token format in the authorization header. 
Please use the following json format for the body:
```
{
  content: string,
  post: post_id
}
```
A successful response will contain a message and a representation of the comment submitted, all in json.

### Submit a submission
`POST /submission`
Please use the bearer token format in the authorization header. 
Please use the following json format for the body:
```
{
  title: string,
  link: string
}
```
A successful response will contain a message and a representation of the submission submitted, all in json.

### Upvote a submission
`PATCH /:id`
A successful response will contain a message.

## Testing
The intergration test is located in the `tests` directory. It can be run by using `jest`.
