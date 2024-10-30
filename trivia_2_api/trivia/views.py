from django.shortcuts import get_object_or_404
from django.http import HttpResponse

from rest_framework import viewsets
from rest_framework.response import Response

from .models import Question


# Create your views here.

def index(request):

    return HttpResponse("Hello Trivia People")

class QuestionViewSet(viewsets.ModelViewSet):
    def list(self, request):
        queryset = Question.objects.all()   
        serializer = QuestionSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, id=None):
        queryset = Question.objects.all()
        question = get_object_or_404(queryset, id=id)
        serializer = QuestionSerializer(user)
        return Response(serializer.data)
