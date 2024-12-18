
# TODO
### Tasks
- [ ] Allow entering a custom question time from the host page
- [ ] If there is a custom question time, add a timer to the question page and advance to the next question when it expires
- [ ] View past game scores and teams under the account page
- [ ] Enable add questions
- [ ] enable deck creation based on the questions you have created
- [ ] Add way to edit decks from the deck details page. Add an edit button that allows you to select questions to reroll from that category (select the first three questions that they should be deleted and rerolled from the question pool).

### Bugs

# Assigned

### Dagny

### Patrick

### Walker
- [ ] score page styling
- [ ] join page styling
- [ ] Can't read deck name on the host page due to the font color
- [ ] Head size adjusted (thinner)
- [ ] Ensure formatting reaches the bottom of the page on a monitor sized screen
- [ ] Ensure all pages go up to the bottom of the header

### Zach



# Shelved
- [ ] Ability to join active games rather than just loading games
- [ ] T/F questions should have their answers only populate to A and B answer options (not D or C) and should be in order
- [ ] Allow hosts to be on a team (API and then front end)

# Completed
- [x] Creating a deck should add it to the UserDecks table
    - see the DecksPage for how to get userid, but this needs to be a js file for it to work, otherwise you need to create a ts version of UserProvider.js
 - [x] Way to buy or add decks from the decks page to your account
 - [x] Create global var for url_start in services pages
    - not need bc axios does it
- [x] disable answer buttons if the answer option is null
- [x] Enable filtering to just view your decks on the decks page
- [x] reroll questions. This could also be allowed during deck creation but doesn't have to be. 
- [x] Create Game should return game join code as well
- [x] decks page does not immediately load decks until you click on a button
- [x] Add team scores to game page
- [x] Handle end of round and end of game
- [x] Allow non hosts to join a game
- [x] Selected team should be highlighted on joinPage
