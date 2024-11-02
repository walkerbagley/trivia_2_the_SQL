from django.contrib import admin

from .models import Deck, Game, Host, DeckQuestion, HostDeck, QuestionAttribute, Question, Score, TeamMember, Team, User
# Register your models here.

admin.site.register(Deck)
admin.site.register(Game)
admin.site.register(Host)
admin.site.register(DeckQuestion)
admin.site.register(HostDeck)
admin.site.register(QuestionAttribute)
admin.site.register(Question)
admin.site.register(Score)
admin.site.register(TeamMember)
admin.site.register(Team)
admin.site.register(User)
