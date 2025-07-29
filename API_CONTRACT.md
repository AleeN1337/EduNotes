auth

POST
/auth/register
Create User

POST
/auth/login
Login For Access Token

users

PUT
/users/{user_id}/change_password
Change Password

PUT
/users/{user_id}/avatar
Update User Avatar

GET
/users/
Read Users

GET
/users/{user_id}
Read User

DELETE
/users/{user_id}
Delete User

PUT
/users/{user_id}
Update User

organizations

GET
/organizations/my
Read My Organizations

GET
/organizations/
Read Organizations

POST
/organizations/
Create Organization

GET
/organizations/{organization_id}
Read Organization

DELETE
/organizations/{organization_id}
Delete Organization

PUT
/organizations/{organization_id}
Update Organization

channels

GET
/channels/channels_in_organization
Read Channels In Organization

GET
/channels/
Read Channels

POST
/channels/
Create Channel

GET
/channels/{channel_id}
Read Channel

DELETE
/channels/{channel_id}
Delete Channel

PUT
/channels/{channel_id}
Update Channel

topics

GET
/topics/topics_in_channel
Read Topics In Channel

GET
/topics/
Read Topics

POST
/topics/
Create Topic

GET
/topics/{topic_id}
Read Topic

DELETE
/topics/{topic_id}
Delete Topic

PUT
/topics/{topic_id}
Update Topic

notes

GET
/notes/my
Read My Notes

GET
/notes/notes_in_topic
Read Notes In Topic

POST
/notes/give_like
Give Like

POST
/notes/give_dislike
Give Dislike

GET
/notes/
Read Notes

POST
/notes/
Create Note

GET
/notes/{note_id}
Read Note

DELETE
/notes/{note_id}
Delete Note

organization_users

GET
/organization_users/me
Get Current User Organizations

GET
/organization_users/{organization_id}/{user_id}/role
Get User Role

PUT
/organization_users/{organization_id}/{user_id}/role
Update User Role

POST
/organization_users/invite
Invite User To Organization

DELETE
/organization_users/RemoveUserFromOrganization
Remove User From Organization

GET
/organization_users/
Read Users

POST
/organization_users/
Create Organization User

GET
/organization_users/{organization_id}
Read Organization User

DELETE
/organization_users/{organization_id}/{user_id}
Delete Organization User

Organization Invitations

POST
/organization-invitations/
Invite User

POST
/organization-invitations/{invitation_id}/decline
Decline Invitation

POST
/organization-invitations/{invitation_id}/accept
Accept Invitation

GET
/organization-invitations/my
My Invitations

GET
/organization-invitations/sent
Sent Invitations

ranking

GET
/ranking/my
Get My Score

GET
/ranking/
Get All Users Score

GET
/ranking/{user_id}
Get User Score

deadlines

GET
/deadlines/my_deadlines
Get My Deadlines

GET
/deadlines/
Read Deadlines

POST
/deadlines/
Create Deadline

GET
/deadlines/{deadline_id}
Read Deadline

PUT
/deadlines/{deadline_id}
Update Deadline

DELETE
/deadlines/{deadline_id}
Delete Deadline

Notifications

GET
/notifications/my
Get My Notifications

PUT
/notifications/{notification_id}/read
Mark Notification As Read

DELETE
/notifications/{notification_id}
Delete My Notification

GET
/notifications/{notification_id}
Get Notification

GET
/notifications/
Get Notifications

DELETE
/notifications/
Delete All My Notifications

AI Summary

GET
/ai_summary/
Get Ai Summary

POST
/ai_summary/
Create Ai Summary

PUT
/ai_summary/{summary_id}
Update Ai Summary

DELETE
/ai_summary/{summary_id}
Delete Ai Summary

default

GET
/
Read Root
