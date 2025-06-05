# DevTinder-backend

## APIs

### AuthRoter
- POST /signup
- POST /login
- POST /logout

### ProfileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

### ConnectionRequests
- POST /request/send/intersted/:userId
- POST /request/send/ignored/:userId

- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

### UserFeed
- GET /user/connections
- GET /user/requests/pending
- GET /user/feed - gives the profiles on the platform

Status - ignore, interested, accepted, rejected
