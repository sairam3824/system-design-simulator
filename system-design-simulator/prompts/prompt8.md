Hey calude, till now we build frontend, its time to the backend

Key logic:
analyze the user data: experience level, skills, companies e.t.c from the user profile section and if their are empty just leave them
also take the latest resume
Dont just use their selected difficulty easy/medium/hard
smart adjustment of their difficulty to be made by using openai api with the help of this data and their selected difficulty level

for eg: if beginner selects hard -> give them medium questions

want to build
api end point of openai api that takes user profile + selected difficulty
algorithm n calculates actual difficulty based on :

experience
skills
preferences
companies they needed
and latest resume

give each of them a weightage

openai api to generate questions matching their skills etc...
return personalized question set for the user
