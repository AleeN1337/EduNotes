FastAPI
 0.1.0 
OAS 3.1
/openapi.json

Authorize
auth


POST
/auth/register
Create User

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "username": "string",
  "email": "string",
  "password": "string",
  "first_name": "string",
  "last_name": "string"
}
Responses
Code	Description	Links
201	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "user_id": 0,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "score": 0,
    "avatar_url": "string",
    "rank": "niekompetentny"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

POST
/auth/login
Login For Access Token

Parameters
Try it out
No parameters

Request body

application/x-www-form-urlencoded
grant_type
string | (string | null)
pattern: ^password$
username *
string
password *
string($password)
scope
string
client_id
string | (string | null)
client_secret
string | (string | null)($password)
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "access_token": "string",
  "token_type": "string"
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links
users


PUT
/users/{user_id}/change_password
Change Password


Parameters
Try it out
No parameters

Request body

application/x-www-form-urlencoded
old_password *
string
new_password *
string
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
"string"
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

PUT
/users/{user_id}/avatar
Update User Avatar


Parameters
Try it out
No parameters

Request body

multipart/form-data
file *
string($binary)
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
"string"
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/users/
Read Users

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "user_id": 0,
      "username": "string",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "score": 0,
      "avatar_url": "string",
      "rank": "niekompetentny"
    }
  ]
}
No links

GET
/users/{user_id}
Read User

Parameters
Try it out
Name	Description
user_id *
integer
(path)
user_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "user_id": 0,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "score": 0,
    "avatar_url": "string",
    "rank": "niekompetentny"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

DELETE
/users/{user_id}
Delete User


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "user_id": 0,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "score": 0,
    "avatar_url": "string",
    "rank": "niekompetentny"
  }
}
No links

PUT
/users/{user_id}
Update User

Parameters
Try it out
Name	Description
user_id *
integer
(path)
user_id
Request body

application/json
Example Value
Schema
{
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "password": "string"
}
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "user_id": 0,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "score": 0,
    "avatar_url": "string",
    "rank": "niekompetentny"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links
organizations


GET
/organizations/my
Read My Organizations


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "organization_id": 0,
      "organization_name": "string",
      "created_at": "2025-07-31T11:45:23.004Z",
      "updated_at": "2025-07-31T11:45:23.004Z"
    }
  ]
}
No links

GET
/organizations/
Read Organizations

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "organization_id": 0,
      "organization_name": "string",
      "created_at": "2025-07-31T11:45:23.005Z",
      "updated_at": "2025-07-31T11:45:23.005Z"
    }
  ]
}
No links

POST
/organizations/
Create Organization


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "organization_name": "string"
}
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "organization_id": 0,
    "organization_name": "string",
    "created_at": "2025-07-31T11:45:23.007Z",
    "updated_at": "2025-07-31T11:45:23.007Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/organizations/{organization_id}
Read Organization

Parameters
Try it out
Name	Description
organization_id *
integer
(path)
organization_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "organization_id": 0,
    "organization_name": "string",
    "created_at": "2025-07-31T11:45:23.009Z",
    "updated_at": "2025-07-31T11:45:23.009Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

DELETE
/organizations/{organization_id}
Delete Organization


Parameters
Try it out
Name	Description
organization_id *
integer
(path)
organization_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "organization_id": 0,
    "organization_name": "string",
    "created_at": "2025-07-31T11:45:23.012Z",
    "updated_at": "2025-07-31T11:45:23.012Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

PUT
/organizations/{organization_id}
Update Organization

Parameters
Try it out
Name	Description
organization_id *
integer
(path)
organization_id
Request body

application/json
Example Value
Schema
{
  "organization_name": "string"
}
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "organization_id": 0,
    "organization_name": "string",
    "created_at": "2025-07-31T11:45:23.019Z",
    "updated_at": "2025-07-31T11:45:23.019Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links
channels


GET
/channels/channels_in_organization
Read Channels In Organization

Parameters
Try it out
Name	Description
organization_id *
integer
(query)
organization_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "channel_id": 0,
      "channel_name": "string",
      "organization_id": 0,
      "created_at": "2025-07-31T11:45:23.021Z",
      "updated_at": "2025-07-31T11:45:23.021Z"
    }
  ]
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/channels/
Read Channels

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "channel_id": 0,
      "channel_name": "string",
      "organization_id": 0,
      "created_at": "2025-07-31T11:45:23.023Z",
      "updated_at": "2025-07-31T11:45:23.023Z"
    }
  ]
}
No links

POST
/channels/
Create Channel

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "channel_name": "string",
  "organization_id": 0
}
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "channel_id": 0,
    "channel_name": "string",
    "organization_id": 0,
    "created_at": "2025-07-31T11:45:23.025Z",
    "updated_at": "2025-07-31T11:45:23.025Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/channels/{channel_id}
Read Channel

Parameters
Try it out
Name	Description
channel_id *
integer
(path)
channel_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "channel_id": 0,
    "channel_name": "string",
    "organization_id": 0,
    "created_at": "2025-07-31T11:45:23.028Z",
    "updated_at": "2025-07-31T11:45:23.028Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

DELETE
/channels/{channel_id}
Delete Channel


Parameters
Try it out
Name	Description
channel_id *
integer
(path)
channel_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "channel_id": 0,
    "channel_name": "string",
    "organization_id": 0,
    "created_at": "2025-07-31T11:45:23.030Z",
    "updated_at": "2025-07-31T11:45:23.030Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

PUT
/channels/{channel_id}
Update Channel

Parameters
Try it out
Name	Description
channel_id *
integer
(path)
channel_id
Request body

application/json
Example Value
Schema
{
  "channel_name": "string",
  "organization_id": 0
}
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "channel_id": 0,
    "channel_name": "string",
    "organization_id": 0,
    "created_at": "2025-07-31T11:45:23.033Z",
    "updated_at": "2025-07-31T11:45:23.033Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links
topics


GET
/topics/topics_in_channel
Read Topics In Channel

Parameters
Try it out
Name	Description
channel_id *
integer
(query)
channel_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "topic_id": 0,
      "topic_name": "string",
      "channel_id": 0,
      "organization_id": 0,
      "created_at": "2025-07-31T11:45:23.035Z",
      "updated_at": "2025-07-31T11:45:23.035Z"
    }
  ]
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/topics/
Read Topics

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "topic_id": 0,
      "topic_name": "string",
      "channel_id": 0,
      "organization_id": 0,
      "created_at": "2025-07-31T11:45:23.037Z",
      "updated_at": "2025-07-31T11:45:23.037Z"
    }
  ]
}
No links

POST
/topics/
Create Topic

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "topic_name": "string",
  "channel_id": 0,
  "organization_id": 0
}
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "topic_id": 0,
    "topic_name": "string",
    "channel_id": 0,
    "organization_id": 0,
    "created_at": "2025-07-31T11:45:23.039Z",
    "updated_at": "2025-07-31T11:45:23.039Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/topics/{topic_id}
Read Topic

Parameters
Try it out
Name	Description
topic_id *
integer
(path)
topic_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "topic_id": 0,
    "topic_name": "string",
    "channel_id": 0,
    "organization_id": 0,
    "created_at": "2025-07-31T11:45:23.041Z",
    "updated_at": "2025-07-31T11:45:23.041Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

DELETE
/topics/{topic_id}
Delete Topic

Parameters
Try it out
Name	Description
topic_id *
integer
(path)
topic_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "topic_id": 0,
    "topic_name": "string",
    "channel_id": 0,
    "organization_id": 0,
    "created_at": "2025-07-31T11:45:23.043Z",
    "updated_at": "2025-07-31T11:45:23.043Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

PUT
/topics/{topic_id}
Update Topic

Parameters
Try it out
Name	Description
topic_id *
integer
(path)
topic_id
Request body

application/json
Example Value
Schema
{
  "topic_name": "string",
  "channel_id": 0,
  "organization_id": 0
}
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "topic_id": 0,
    "topic_name": "string",
    "channel_id": 0,
    "organization_id": 0,
    "created_at": "2025-07-31T11:45:23.047Z",
    "updated_at": "2025-07-31T11:45:23.047Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links
notes


GET
/notes/my
Read My Notes


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "note_id": 0,
      "title": "string",
      "topic_id": 0,
      "organization_id": 0,
      "user_id": 0,
      "content_type": "string",
      "content": "string",
      "image_url": "string",
      "likes": 0,
      "created_at": "2025-07-31T11:45:23.049Z",
      "updated_at": "2025-07-31T11:45:23.049Z"
    }
  ]
}
No links

GET
/notes/notes_in_topic
Read Notes In Topic

Parameters
Try it out
Name	Description
topic_id *
integer
(query)
topic_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "note_id": 0,
      "title": "string",
      "topic_id": 0,
      "organization_id": 0,
      "user_id": 0,
      "content_type": "string",
      "content": "string",
      "image_url": "string",
      "likes": 0,
      "created_at": "2025-07-31T11:45:23.050Z",
      "updated_at": "2025-07-31T11:45:23.050Z"
    }
  ]
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

POST
/notes/give_like
Give Like


Parameters
Try it out
Name	Description
note_id *
integer
(query)
note_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "additionalProp1": {}
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

POST
/notes/give_dislike
Give Dislike


Parameters
Try it out
Name	Description
note_id *
integer
(query)
note_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "additionalProp1": {}
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/notes/
Read Notes

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "note_id": 0,
      "title": "string",
      "topic_id": 0,
      "organization_id": 0,
      "user_id": 0,
      "content_type": "string",
      "content": "string",
      "image_url": "string",
      "likes": 0,
      "created_at": "2025-07-31T11:45:23.055Z",
      "updated_at": "2025-07-31T11:45:23.055Z"
    }
  ]
}
No links

POST
/notes/
Create Note


Parameters
Try it out
No parameters

Request body

multipart/form-data
title *
string
topic_id *
integer
organization_id *
integer
content_type *
string
content
string | (string | null)
image
string | (string | null)($binary)
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "note_id": 0,
    "title": "string",
    "topic_id": 0,
    "organization_id": 0,
    "user_id": 0,
    "content_type": "string",
    "content": "string",
    "image_url": "string",
    "likes": 0,
    "created_at": "2025-07-31T11:45:23.060Z",
    "updated_at": "2025-07-31T11:45:23.060Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/notes/{note_id}
Read Note

Parameters
Try it out
Name	Description
note_id *
integer
(path)
note_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "note_id": 0,
    "title": "string",
    "topic_id": 0,
    "organization_id": 0,
    "user_id": 0,
    "content_type": "string",
    "content": "string",
    "image_url": "string",
    "likes": 0,
    "created_at": "2025-07-31T11:45:23.063Z",
    "updated_at": "2025-07-31T11:45:23.063Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

DELETE
/notes/{note_id}
Delete Note

Parameters
Try it out
Name	Description
note_id *
integer
(path)
note_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "note_id": 0,
    "title": "string",
    "topic_id": 0,
    "organization_id": 0,
    "user_id": 0,
    "content_type": "string",
    "content": "string",
    "image_url": "string",
    "likes": 0,
    "created_at": "2025-07-31T11:45:23.065Z",
    "updated_at": "2025-07-31T11:45:23.065Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links
organization_users


GET
/organization_users/me
Get Current User Organizations


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "organization_id": 0,
      "user_id": 0,
      "role": "string",
      "updated_at": "2025-07-31T11:45:23.066Z"
    }
  ]
}
No links

GET
/organization_users/{organization_id}/{user_id}/role
Get User Role

Parameters
Try it out
Name	Description
organization_id *
integer
(path)
organization_id
user_id *
integer
(path)
user_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "additionalProp1": {}
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

PUT
/organization_users/{organization_id}/{user_id}/role
Update User Role

Parameters
Try it out
Name	Description
organization_id *
integer
(path)
organization_id
user_id *
integer
(path)
user_id
Request body

application/x-www-form-urlencoded
role
string
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "additionalProp1": {}
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

POST
/organization_users/invite
Invite User To Organization


Parameters
Try it out
Name	Description
organization_id *
integer
(query)
organization_id
invited_user_id *
integer
(query)
invited_user_id
Request body

application/x-www-form-urlencoded
role
string
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "additionalProp1": {}
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

DELETE
/organization_users/RemoveUserFromOrganization
Remove User From Organization


Parameters
Try it out
Name	Description
organization_id *
integer
(query)
organization_id
user_id *
integer
(query)
user_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "organization_id": 0,
    "user_id": 0,
    "role": "string",
    "updated_at": "2025-07-31T11:45:23.078Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/organization_users/
Read Users

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "organization_id": 0,
      "user_id": 0,
      "role": "string",
      "updated_at": "2025-07-31T11:45:23.079Z"
    }
  ]
}
No links

POST
/organization_users/
Create Organization User

Parameters
Try it out
Name	Description
organization_id *
integer
(query)
organization_id
user_id *
integer
(query)
user_id
Request body

application/x-www-form-urlencoded
role
string
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "organization_id": 0,
    "user_id": 0,
    "role": "string",
    "updated_at": "2025-07-31T11:45:23.082Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/organization_users/{organization_id}
Read Organization User

Parameters
Try it out
Name	Description
organization_id *
integer
(path)
organization_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "organization_id": 0,
      "user_id": 0,
      "role": "string",
      "updated_at": "2025-07-31T11:45:23.084Z"
    }
  ]
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

DELETE
/organization_users/{organization_id}/{user_id}
Delete Organization User

Parameters
Try it out
Name	Description
organization_id *
integer
(path)
organization_id
user_id *
integer
(path)
user_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": "string"
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links
Organization Invitations


POST
/organization-invitations/
Invite User


Parameters
Try it out
Name	Description
organization_id *
integer
(query)
organization_id
email *
string
(query)
email
role *
string
(query)
Available values : user, owner


user
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "invitation_id": 0,
    "organization_id": 0,
    "email": "string",
    "role": "user",
    "status": "pending",
    "invited_by_user_id": 0,
    "created_at": "2025-07-31T11:45:23.090Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

POST
/organization-invitations/{invitation_id}/decline
Decline Invitation


Parameters
Try it out
Name	Description
invitation_id *
integer
(path)
invitation_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": "string"
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

POST
/organization-invitations/{invitation_id}/accept
Accept Invitation


Parameters
Try it out
Name	Description
invitation_id *
integer
(path)
invitation_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": "string"
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/organization-invitations/my
My Invitations


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "invitation_id": 0,
      "organization_id": 0,
      "email": "string",
      "role": "user",
      "status": "pending",
      "invited_by_user_id": 0,
      "created_at": "2025-07-31T11:45:23.095Z"
    }
  ]
}
No links

GET
/organization-invitations/sent
Sent Invitations


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "invitation_id": 0,
      "organization_id": 0,
      "email": "string",
      "role": "user",
      "status": "pending",
      "invited_by_user_id": 0,
      "created_at": "2025-07-31T11:45:23.096Z"
    }
  ]
}
No links
ranking


GET
/ranking/my
Get My Score


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "additionalProp1": {}
  }
}
No links

GET
/ranking/
Get All Users Score

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "additionalProp1": {}
    }
  ]
}
No links

GET
/ranking/{user_id}
Get User Score

Parameters
Try it out
Name	Description
user_id *
integer
(path)
user_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "additionalProp1": {}
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links
deadlines


GET
/deadlines/my_deadlines
Get My Deadlines


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "deadline_id": 0,
      "event_type": "Egzamin",
      "event_name": "string",
      "event_description": "string",
      "event_date": "2025-07-31T11:45:23.100Z",
      "organization_id": 0,
      "created_by": 0,
      "created_at": "2025-07-31T11:45:23.100Z",
      "updated_at": "2025-07-31T11:45:23.100Z"
    }
  ]
}
No links
404	
Not found

No links

GET
/deadlines/
Read Deadlines

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "deadline_id": 0,
      "event_type": "Egzamin",
      "event_name": "string",
      "event_description": "string",
      "event_date": "2025-07-31T11:45:23.101Z",
      "organization_id": 0,
      "created_by": 0,
      "created_at": "2025-07-31T11:45:23.101Z",
      "updated_at": "2025-07-31T11:45:23.101Z"
    }
  ]
}
No links
404	
Not found

No links

POST
/deadlines/
Create Deadline


Parameters
Try it out
No parameters

Request body

application/x-www-form-urlencoded
event_type *
string
event_name *
string
event_description
string | (string | null)
event_date *
string($date-time)
organization_id *
integer
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "deadline_id": 0,
    "event_type": "Egzamin",
    "event_name": "string",
    "event_description": "string",
    "event_date": "2025-07-31T11:45:23.106Z",
    "organization_id": 0,
    "created_by": 0,
    "created_at": "2025-07-31T11:45:23.106Z",
    "updated_at": "2025-07-31T11:45:23.106Z"
  }
}
No links
404	
Not found

No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/deadlines/{deadline_id}
Read Deadline

Parameters
Try it out
Name	Description
deadline_id *
integer
(path)
deadline_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "deadline_id": 0,
    "event_type": "Egzamin",
    "event_name": "string",
    "event_description": "string",
    "event_date": "2025-07-31T11:45:23.108Z",
    "organization_id": 0,
    "created_by": 0,
    "created_at": "2025-07-31T11:45:23.108Z",
    "updated_at": "2025-07-31T11:45:23.108Z"
  }
}
No links
404	
Not found

No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

PUT
/deadlines/{deadline_id}
Update Deadline

Parameters
Try it out
Name	Description
deadline_id *
integer
(path)
deadline_id
Request body

application/x-www-form-urlencoded
event_type *
string
event_name *
string
event_description
string | (string | null)
event_date *
string($date-time)
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "deadline_id": 0,
    "event_type": "Egzamin",
    "event_name": "string",
    "event_description": "string",
    "event_date": "2025-07-31T11:45:23.113Z",
    "organization_id": 0,
    "created_by": 0,
    "created_at": "2025-07-31T11:45:23.113Z",
    "updated_at": "2025-07-31T11:45:23.113Z"
  }
}
No links
404	
Not found

No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

DELETE
/deadlines/{deadline_id}
Delete Deadline

Parameters
Try it out
Name	Description
deadline_id *
integer
(path)
deadline_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": "string"
}
No links
404	
Not found

No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links
Notifications


GET
/notifications/my
Get My Notifications


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "notification_id": 0,
      "user_id": 0,
      "status": "string",
      "message": "string",
      "created_at": "2025-07-31T11:45:23.123Z"
    }
  ]
}
No links

PUT
/notifications/{notification_id}/read
Mark Notification As Read


Parameters
Try it out
Name	Description
notification_id *
integer
(path)
notification_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "notification_id": 0,
    "user_id": 0,
    "status": "string",
    "message": "string",
    "created_at": "2025-07-31T11:45:23.124Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

DELETE
/notifications/{notification_id}
Delete My Notification


Parameters
Try it out
Name	Description
notification_id *
integer
(path)
notification_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "notification_id": 0,
    "user_id": 0,
    "status": "string",
    "message": "string",
    "created_at": "2025-07-31T11:45:23.126Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/notifications/{notification_id}
Get Notification

Parameters
Try it out
Name	Description
notification_id *
integer
(path)
notification_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "notification_id": 0,
    "user_id": 0,
    "status": "string",
    "message": "string",
    "created_at": "2025-07-31T11:45:23.128Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

GET
/notifications/
Get Notifications

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "notification_id": 0,
      "user_id": 0,
      "status": "string",
      "message": "string",
      "created_at": "2025-07-31T11:45:23.130Z"
    }
  ]
}
No links

DELETE
/notifications/
Delete All My Notifications


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "notification_id": 0,
      "user_id": 0,
      "status": "string",
      "message": "string",
      "created_at": "2025-07-31T11:45:23.131Z"
    }
  ]
}
No links
AI Summary


GET
/ai_summary/
Get Ai Summary

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": [
    {
      "summary_id": 0,
      "topic_id": 0,
      "summary_text": "string",
      "created_at": "2025-07-31T11:45:23.132Z",
      "updated_at": "2025-07-31T11:45:23.132Z"
    }
  ]
}
No links

POST
/ai_summary/
Create Ai Summary

Parameters
Try it out
Name	Description
topic_id *
integer
(query)
topic_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "summary_id": 0,
    "topic_id": 0,
    "summary_text": "string",
    "created_at": "2025-07-31T11:45:23.133Z",
    "updated_at": "2025-07-31T11:45:23.133Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

PUT
/ai_summary/{summary_id}
Update Ai Summary

Parameters
Try it out
Name	Description
summary_id *
integer
(path)
summary_id
topic_id *
integer
(query)
topic_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": {
    "summary_id": 0,
    "topic_id": 0,
    "summary_text": "string",
    "created_at": "2025-07-31T11:45:23.136Z",
    "updated_at": "2025-07-31T11:45:23.136Z"
  }
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links

DELETE
/ai_summary/{summary_id}
Delete Ai Summary

Parameters
Try it out
Name	Description
summary_id *
integer
(path)
summary_id
Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "message": "string",
  "data": "string"
}
No links
422	
Validation Error

Media type

application/json
Example Value
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
No links
default


GET
/
Read Root

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Successful Response

Media type

application/json
Controls Accept header.
Example Value
Schema
"string"
No links

Schemas
Body_change_password_users__user_id__change_password_putCollapse allobject
old_passwordstring
new_passwordstring
Body_create_note_notes__postCollapse allobject
titlestring
topic_idinteger
organization_idinteger
content_typeExpand allstring
contentExpand all(string | null)
imageExpand all(string | null)
Body_create_organization_user_organization_users__postCollapse allobject
roleExpand allstring
Body_invite_user_to_organization_organization_users_invite_postCollapse allobject
roleExpand allstring
Body_login_for_access_token_auth_login_postCollapse allobject
grant_typeCollapse all(string | null)
Any ofCollapse all(string | null)
#0stringmatches ^password$
#1null
usernamestring
passwordstringpassword
scopeCollapse allstring
Default""
client_idCollapse all(string | null)
Any ofCollapse all(string | null)
#0string
#1null
client_secretCollapse allstring | (string | null)password
Any ofCollapse all(string | null)
#0string
#1null
Body_update_user_avatar_users__user_id__avatar_putCollapse allobject
filestringbinary
Body_update_user_role_organization_users__organization_id___user_id__role_putCollapse allobject
roleExpand allstring
CreateChannelRequestCollapse allobject
channel_namestring
organization_idinteger
CreateDeadlineCollapse allobject
event_typeExpand allstring
event_namestring
event_descriptionExpand all(string | null)
event_datestringdate-time
organization_idinteger
CreateOrganizationRequestCollapse allobject
organization_namestring
CreateTopicRequestCollapse allobject
topic_namestring
channel_idinteger
organization_idinteger
CreateUserRequestCollapse allobject
usernamestring
emailstring
passwordstring
first_namestring
last_namestring
EventTypeEnumCollapse allstring
EnumExpand allarray
HTTPValidationErrorCollapse allobject
detailExpand allarray<object>
InvitedUserRoleEnumCollapse allstring
EnumExpand allarray
NoteContentTypeEnumCollapse allstring
EnumExpand allarray
RankEnumCollapse allstring
EnumExpand allarray
ReadAISummaryCollapse allobject
summary_idinteger
topic_idinteger
summary_textstring
created_atstringdate-time
updated_atExpand all(string | null)
ReadChannelResponseCollapse allobject
channel_idinteger
channel_namestring
organization_idinteger
created_atstringdate-time
updated_atExpand all(string | null)
ReadDeadlineCollapse allobject
deadline_idinteger
event_typeExpand allstring
event_namestring
event_descriptionExpand all(string | null)
event_datestringdate-time
organization_idinteger
created_byinteger
created_atstringdate-time
updated_atExpand all(string | null)
ReadNoteResponseCollapse allobject
note_idinteger
titlestring
topic_idinteger
organization_idinteger
user_idinteger
content_typestring
contentExpand all(string | null)
image_urlExpand all(string | null)
likesinteger
created_atstringdate-time
updated_atExpand all(string | null)
ReadNotificationsCollapse allobject
notification_idinteger
user_idinteger
statusstring
messagestring
created_atstringdate-time
ReadOrganizationInvitationCollapse allobject
invitation_idinteger
organization_idinteger
emailstring
roleExpand allstring
statusExpand allstring
invited_by_user_idinteger
created_atstringdate-time
ReadOrganizationResponseCollapse allobject
organization_idinteger
organization_namestring
created_atstringdate-time
updated_atExpand all(string | null)
ReadOrganizationUserResponseCollapse allobject
organization_idinteger
user_idinteger
rolestring
updated_atExpand all(string | null)
ReadTopicResponseCollapse allobject
topic_idinteger
topic_namestring
channel_idinteger
organization_idinteger
created_atstringdate-time
updated_atExpand all(string | null)
ReadUsersResponseCollapse allobject
user_idinteger
usernamestring
emailstring
first_namestring
last_namestring
scoreinteger
avatar_urlExpand all(string | null)
rankExpand allstring
StandardResponseCollapse allobject
successboolean
messagestring
dataExpand all(any | null)
StandardResponse[ReadAISummary]Collapse allobject
successboolean
messagestring
dataExpand all(object | null)
StandardResponse[ReadChannelResponse]Collapse allobject
successboolean
messagestring
dataExpand all(object | null)
StandardResponse[ReadDeadline]Collapse allobject
successboolean
messagestring
dataExpand all(object | null)
StandardResponse[ReadNoteResponse]Collapse allobject
successboolean
messagestring
dataExpand all(object | null)
StandardResponse[ReadNotifications]Collapse allobject
successboolean
messagestring
dataExpand all(object | null)
StandardResponse[ReadOrganizationInvitation]Collapse allobject
successboolean
messagestring
dataExpand all(object | null)
StandardResponse[ReadOrganizationResponse]Collapse allobject
successboolean
messagestring
dataExpand all(object | null)
StandardResponse[ReadOrganizationUserResponse]Collapse allobject
successboolean
messagestring
dataExpand all(object | null)
StandardResponse[ReadTopicResponse]Collapse allobject
successboolean
messagestring
dataExpand all(object | null)
StandardResponse[ReadUsersResponse]Collapse allobject
successboolean
messagestring
dataExpand all(object | null)
StandardResponse[dict]Collapse allobject
successboolean
messagestring
dataExpand all(object | null)
StandardResponse[list[ReadAISummary]]Collapse allobject
successboolean
messagestring
dataExpand all(array<object> | null)
StandardResponse[list[ReadChannelResponse]]Collapse allobject
successboolean
messagestring
dataExpand all(array<object> | null)
StandardResponse[list[ReadDeadline]]Collapse allobject
successboolean
messagestring
dataExpand all(array<object> | null)
StandardResponse[list[ReadNoteResponse]]Collapse allobject
successboolean
messagestring
dataExpand all(array<object> | null)
StandardResponse[list[ReadNotifications]]Collapse allobject
successboolean
messagestring
dataExpand all(array<object> | null)
StandardResponse[list[ReadOrganizationInvitation]]Collapse allobject
successboolean
messagestring
dataExpand all(array<object> | null)
StandardResponse[list[ReadOrganizationResponse]]Collapse allobject
successboolean
messagestring
dataCollapse all(array<object> | null)
Any ofCollapse all(array<object> | null)
#0Collapse allarray<object>
ItemsCollapse allobject
organization_idinteger
organization_namestring
created_atstringdate-time
updated_atCollapse all(string | null)
Any ofCollapse all(string | null)
#0stringdate-time
#1null
#1null
StandardResponse[list[ReadOrganizationUserResponse]]Collapse allobject
successboolean
messagestring
dataExpand all(array<object> | null)
StandardResponse[list[ReadTopicResponse]]Collapse allobject
successboolean
messagestring
dataExpand all(array<object> | null)
StandardResponse[list[ReadUsersResponse]]Collapse allobject
successboolean
messagestring
dataExpand all(array<object> | null)
StandardResponse[list[dict]]Collapse allobject
successboolean
messagestring
dataExpand all(array<object> | null)
StatusEnumCollapse allstring
EnumExpand allarray
TokenCollapse allobject
access_tokenstring
token_typestring
UpdateDeadlineCollapse allobject
event_typeExpand allstring
event_namestring
event_descriptionExpand all(string | null)
event_datestringdate-time
UpdateOrganizationRequestCollapse allobject
organization_nameExpand all(string | null)
UpdateTopicRequestCollapse allobject
topic_nameExpand all(string | null)
channel_idExpand all(integer | null)
organization_idExpand all(integer | null)
UpdateUserRequestCollapse allobject
usernameExpand all(string | null)
emailExpand all(string | null)
first_nameExpand all(string | null)
last_nameExpand all(string | null)
passwordExpand all(string | null)
UserRoleEnumCollapse allstring
EnumExpand allarray
ValidationErrorCollapse allobject
locExpand allarray<(string | integer)>
msgstring
typestring