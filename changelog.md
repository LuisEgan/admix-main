--- 2.4.2
Update Unity plugin to v1.7.1

--- 2.4.1
Update Unity plugin to v1.6.3
AppActivation route now updated the app per url param

--- 2.4.0
Fix report not showing data at first sometimes
Add tooltips to navigation buttons
Report panel now shows the name of the selected app. In case of "All apps report"
it shows "My apps" with no navigation buttons.
Add navigation buttons to all panels
Simplify AdmixCalculator component
Redo /profile - Follow same structure as Edit page with left panel - Organise existing sections into tabs - Link to T&Cs / logout button
Add profile link with picture to side menu
Delete header Menu
Change /info calculator formula - CPM fixed to 10 - Add .25 multiplicator - Remove .00 to digits
Add guide texts to /info
Add store url to review popup
Add tutorial video in download section
Hide filter and global report if there are no apps
Separate in routes login and register forms in: /login and /register

--- 2.3.0
/emailSuccess now has a success message and a link to /login

--- 2.2.1
Update plugin download link for plugin v1.6.2

--- 2.2.0
Update noEmail and noPass error messages
Update T&Cs link
Fix download error on user update
Now <PanelFooter /> recieves children and prioritizes them
Add disclaimer to report's panel

--- 2.1.0
Register form dissappears on succesful register
Improve /login feedback
Redirect user when arriving to /emailSuccess to /login with a new message announcing the verification success

--- 2.0.0
API v2 full support
Refactor
