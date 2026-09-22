# PAZUMO Security Boundaries

The reference implementation establishes:
- bearer-token session authentication;
- password hashing with Node scrypt and per-password random salts;
- timing-safe password verification;
- authorization checks on protected mutations;
- ownership-aware download control;
- bounded JSON request bodies;
- bounded captions, comments, usernames and URLs;
- rejection of invalid reaction types;
- publication-state checks;
- security-oriented response headers;
- no-store API responses.

Production hardening still required before public operation:
- managed secrets;
- TLS termination;
- distributed session storage;
- distributed rate limiting;
- CSRF strategy where cookie sessions are introduced;
- production database;
- object storage and signed media URLs;
- malware/media scanning;
- content moderation pipeline;
- abuse detection;
- audit logging and monitoring;
- backup and disaster recovery;
- privacy/retention controls.
