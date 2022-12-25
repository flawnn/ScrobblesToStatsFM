# ScrobblesToStatsFM
Script to transcribe scrobbles from Last.FM to the endsongs.json format (from Spotify) with the aim to import into Stats.FM

## Usage
1. Get your scrobbles downloaded from Last.FM with [this](https://mainstream.ghan.nl/scrobbles.html) tool.
2. Save it in the root directory of this repository as "scrobbles.json".
3. Create a folder named "results" as well in the root directory.
4. Set up config.json with an initial access-/refresh-token pair (just google how to do it, it is straightforward)
5. Run the program (depending on how many streams you want to import this can take up to several hours as the program fetches UIDs from Spotify's API and needs to cope with rate limiting)
6. Rename the created files to endsong_x.json (with x being a random number)
7. Upload to Stats.FM over Import Tool 
8. PROFIT :tada:

## Debugging
The program logs the indices of songs that don't have equivalents found on Spotify, mostly because the search term is just not fitting that time or the song has been deleted. If needed, keep track of these to import them afterwards again to check what led to the search results not being accurate.
<br>(For me,) This has happened rather less frequent and I couldn't come up a smart way to try to get every song that is actually on Spotify without creating too much overhead and still having the program run fast. If this is something you dislike, feel free to PR and suggest your way!

If something breaks down, you always know which pages of your scrobbles have been processed already (the scrobbles.json is sorted after pages with each 200 scrobble entries each).
In the worst case, you can change the loop parameters to start with different indices after having found out about culprits. Feel free to PR if you have found anything
