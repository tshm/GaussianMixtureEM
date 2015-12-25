import Gmem exposing (..)
import Html exposing (text, p, div)

maxPos = 4200

initModel : Model
initModel =
  let
    weights = List.repeat n 0.3
  in
    { clusters =
      [ Cluster (Params (maxPos - 500) 30 0.3) weights
      , Cluster (Params (maxPos      ) 30 0.3) weights
      , Cluster (Params (maxPos + 500) 30 0.3) weights
      ]
    }

model = initModel

n = List.length samples

samples : List Float
samples =
  [ 4391, 4359, 4328, 3938, 4359, 4313, 4500, 3906, 4344, 4546, 4109, 4469, 4531,
  3813, 3922, 4328, 4516, 4406, 4328, 4313, 3844, 3406, 4313, 4422, 3875, 3844,
  4375, 3875, 4328, 4344, 4375, 3922, 3391, 4359, 4344, 3844, 4687, 4297, 3328,
  4359, 4406, 3907, 3906, 3859, 3813, 3375, 4312, 3813, 3890, 3375, 4781, 3937,
  3344, 3359, 3907, 3844, 4406, 4407, 3343, 3375, 4329, 4546, 4329, 3359, 4391,
  3360, 3344, 4344, 4390, 3875, 3422, 4297, 3921, 3875, 3813, 4297, 4031, 3391,
  3875, 3859, 3812, 3891, 3391, 3343, 3828 ]

main =
  let
    --model' = model |> expectation samples
    model' = getGMEM samples model 
    viewCluster c = p [] [text (toString c.params)]
  in div []
     [ p [] <| List.map viewCluster model'.clusters
     --, text <| toString model'
     ]

