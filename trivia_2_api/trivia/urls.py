from django.urls import path, include

from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"question", views.QuestionViewSet, basename="question")
router.register(r"deckquestion", views.DeckQuestionViewSet, basename="deckquestion")
router.register(r"deck", views.DeckViewSet, basename="deck")
router.register(r"game", views.GameViewSet, basename="game")
router.register(r"hostdeck", views.HostDeckViewSet, basename="hostdeck")
router.register(r"host", views.HostViewSet, basename="host")
router.register(r"questionattribute", views.QuestionAttributeViewSet, basename="questionattribute")
router.register(r"score", views.ScoreViewSet, basename="score")
router.register(r"teammember", views.TeamMemberViewSet, basename="teammember")
router.register(r"team", views.TeamViewSet, basename="team")
router.register(r"user", views.UserViewSet, basename="user")


urlpatterns = [
    path("", include(router.urls)),
]