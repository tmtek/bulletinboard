# Bulletin Board

Bulletin Board is a Google Home application built using convo. This app allows familes to have a shred board where they can post notes and notifications for each other.

## Commands

> "Talk to Bulletin Board"

This is the standard entry point into the application. It will read the first page of 5 notes, and then offer you the opportunity to speak another command. 

> "Bring me up to date."
 
 This command will cause the application to read all of the notes on the board, and then exit. If you want to hook Buletin Board up to your daily routines, this is the command to use to do so.

> "Add" or "Add this is an important note everyone should be aware of."
 
 This command allows you to add new notes to the board. If you say "add" and then continue to speak, the application will take the rest of your statement and add it as the note. If you just say "Add", it will then prompt you for a message.

> "Wipe the board"

Clears the entire board of all notes.


## List commands and selecting notes

When you are confronted by a list of notes prsented to you in pages, you may use any of the list commands to keep digging into the data:

> "next page" or "more"

This will read the next page of 5 notes.

> "3 more"

Use this command to go to the next page, but specify how large you want the page to be.

> "previous page"

This will read the previous page of 5 notes. 

> "select the first one" of "pick the third one"
 
Selects the first note in the current page you have been presented.

> "next"

Selects the next items in the list.

> "Previous"

Selects the previous item in the list.

> "Select the one that contains {query}"

You can use this command to select things by their contents.

## Commands for selected notes

When a note is selected, it will be read to you in detail. Aside for list navigation commands, you may also issue the following commands:

> "Delete it" or "Wipe it"

Deletes the current selected note from the list.

## Note Expiry

When you add a new note to the board, Bulletin Board will attempt to extract an expiry time from message itself. When a note expires, it is automatically removed from the board. For example, if you were to say:

> " add get milk today."

Then Bulletin Board will mark this note to expire once the clock passes 11:59 PM this evening.

If you were to say:

> "add Meet John for coffee on Thursday."

Bulletin Board will expire the note at the end of day on the next Thursday that passes. If today is Thursday it will expire tonight, If today is Monday it will expire three days from now, If Today is Friday it will expire 6 days from now.

If an expiry cannot be deduced from the message, then the note does not expire. It will have to be removed manually.
