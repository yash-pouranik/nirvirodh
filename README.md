# nirvirodh.bitBros
Nirvirodh is a secure, team-based collaborative file editing platform built to eliminate editing conflicts within development teams. It introduces a file-locking mechanism, allowing only one user to edit a file at a time, ensuring version consistency and preventing overwrites.

## Core Functionality

- File Locking System: Ensures only one user can edit a file at a time within a team project to avoid conflicts.
- Team-Based Collaboration: Users can create teams, add members, and assign projects to teams for structured work.
- Secure File Uploading: Authenticated users can upload files to their respective projects.
- Role-Based Access: Only team members can view/edit project files, and only admins can delete them.
- Project & Team Management: Users can create and manage multiple projects under different teams.
- Authorization Middleware: Protects routes based on user role and membership status.
