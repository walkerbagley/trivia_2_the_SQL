from django.shortcuts import get_object_or_404
from django.http import HttpResponse

from rest_framework import viewsets
from rest_framework.response import Response

from .models import *
from .modelserializer import *


# Create your views here.

def index(request):

    return HttpResponse("Hello Trivia People")

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class DeckQuestionViewSet(viewsets.ModelViewSet):
    queryset = DeckQuestion.objects.all()
    serializer_class = DeckQuestionSerializer

class DeckViewSet(viewsets.ModelViewSet):
    queryset = Deck.objects.all()
    serializer_class = DeckSerializer

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

class HostDeckViewSet(viewsets.ModelViewSet):
    queryset = HostDeck.objects.all()
    serializer_class = HostDeckSerializer

class HostViewSet(viewsets.ModelViewSet):
    queryset = Host.objects.all()
    serializer_class = HostSerializer

class QuestionAttributeViewSet(viewsets.ModelViewSet):
    queryset = QuestionAttribute.objects.all()
    serializer_class = QuestionAttributeSerializer

class ScoreViewSet(viewsets.ModelViewSet):
    queryset = Score.objects.all()
    serializer_class = ScoreSerializer

class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

