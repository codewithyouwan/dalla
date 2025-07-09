from pydantic import BaseModel, Field
from typing import List

class ReasoningOutput(BaseModel):
    content: str = Field(description="Message you want to show the human")
    plan: List[str] = Field(description="The list of steps the executor needs to perform initially")
    futureplan: List[str] = Field(description="After the executor is done, what might be your next steps based on results")
    taskcomplete: bool = Field(description="Whether the task given human is complete or not, based on executor output and past plan")