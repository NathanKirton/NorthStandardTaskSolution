Interview Task
I have been given a task to improve on a monolithic system:
A Vessel insurer has two separate underwriting systems, each exporting vessel data nightly in different formats.

It has several major issues:
	The current system has different formatting for Vessel Data and Bluecard Data tables.
	Website data can be up to 24 hours out of date.
	Urgent updates (e.g., sanctioned vessels) require manual file edits, which are risky and error‑prone.
	Incorrect or missing data leads to vessel owners complaining, sometimes with financial implications.
	Underwriters increasingly need real‑time or same‑day updates, which the current batch process cannot support.

My recommendations for improving the process to make it more accurate, timely, and easier to support:

Introduce a Cloud Database with a Normalised Data Model:
	To improve on the controdicting formatting (Vessels in collumns and bluecard info in rows in 1 system 
	and vise vera in the other) I should create a system that uses a cloud database including 2 tables and 
	create a relationship between them, this way i can keep vessel and bluecard info in seperate tables but 
	create a relationship through PK and FK creating a 1 to many relationship allowing us to find all the 
	bluecards associated with a vessel.

Replace the 24‑hour batch process with a Real‑Time API:
	Instead of relying on 24 processing i built a REST API including, GET,POST,PUT,DELETE Endpoints. These
	respond instantly allowing the website to reflect changes in milliseconds rather than waiting until 4am.

Support Urgent Modifications via DTO‑Driven PUT Requests:
	With underwriters often needing to make urgent changes a DTO makes sure only valid data fields are updated.
	It also keeps data integrity for the rest of the fields as they are not being altered.

Improve Data Accuracy and Reduce Complaints:
	This system will mitigate chances of having incorrect or missing data, meaning vessel owners are less 
	likely to complain. However its important to note that humman error can occur and although unlikely 
	databases could go down.

Enable Underwriters to Make Real‑Time Updates:
	Because the API is connected to the cloud database underwriters can update vessel and blue card information
	immediately. The website also reflects these changes imediatly meaning there is no dependancy on a hosting
	partner and no waiting for nightly reports.


Adding a Simple Frontend for Managing Vessel & Blue Card Information:
	I have added a simple, user friendly interface using react to allow a user to create, read, update or delete
	vessels and bluecards. The current system replys on Editing large delimited export files, sending files
	through FTP and waiting for refreshes. This removes the friction. 


Run The Project Locally:
	The Azure DB is set to allow all IP's
	run Program.cs using CNTRL F5
	Open a new terminal cd into the frontend folder 
	run npm start
	Frontend will open