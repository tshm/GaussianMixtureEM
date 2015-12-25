module Gmem (Model, Cluster, Params, getGMEM) where
import List exposing (map, map2, repeat, sum, length, foldr)
import Debug exposing (..)
{-| Gaussian Maximization Estimator.
  Definition of variables are:
  * dim : dimension of the problem space. (==1 in the src)
  * k : number of clusters
  * x = (x1, x2, ..., xn) : n-dimensional vector
  * p = (p1, p2, ... pk) : prob. of being within each cluster
  * m = (m1, ... mk) : center of each cluster.
  * s = (s1, ... sk) : size of each cluster.
-}

{-| Dimension
-}
dim : Float
dim = 1.0

{-| constant factor
-}
gconst : Float
gconst = 1.0 / sqrt (2.0 * pi) ^ dim

type alias Samples =
  List Float

type alias Model =
  { clusters : List Cluster
  }

{-| Attribute of the cluster
 model parameter set and 
 membership weight of samples.
-}
type alias Cluster =
  { params : Params
  , weights : List Float
}

{-| Model parameter of the cluster
 mean (center location), size and 
 total membership probabilty.
-}
type alias Params =
  { mean : Float
  , size : Float
  , pmem : Float
  }

-- Gaussian PDF
-- PDF = c / s ^ D * e ^ ( -1/2 * (v - m) ^ 2.0 )
pdf : Float -> Float -> Float -> Float
pdf x m s =
  let
    a = gconst / s ^ dim
    b = -0.5 * (x - m)^2.0 / s / s
  in a * e ^ b

{-| Expectation step.
  updating membership weights, based on
  the current PDF.
-}
updateMembership : Samples -> Cluster -> Cluster
updateMembership xs cluster =
  let
    {params, weights} = cluster
    {mean, size, pmem} = params
    weights' = map2 (\p x -> p * pdf x mean size) weights xs
  in { cluster | weights = weights' }

{-| expectation step (updating weights).
-}
expectation : Samples -> Model -> Model
expectation xs model =
  let
    n = length xs
    zeros : List Float
    zeros = (repeat n 0.0)
    {clusters} = model
    clusters' = map (updateMembership xs) clusters
    wsums = foldr (\c s -> map2 (+) s c.weights) zeros clusters'
    clusters'' = map (\c -> { c | weights = normalize c.weights }) clusters'
    normalize weights = map2 (/) weights wsums
  in { model | clusters = clusters'' }

{-| expectation step (updating weights).
-}
updateParams : Samples -> Cluster -> Cluster
updateParams xs cluster =
  let
    {params, weights} = cluster
    {mean, size, pmem} = params
    n = length xs
    psum = sum weights
    mean' = (sum <| map2 (*) xs weights) / psum
    svar2 = sum <| map2 (\x p -> p * (mean' - x) ^ 2.0) xs weights
    size' = sqrt <| svar2 / psum / dim
    pmem' = sum weights / (toFloat n)
    params' =  { params | mean = mean', size = size', pmem = pmem' }
  in { cluster | params = params' }

{-| maximization step.
-}
maximizeLikelihood : Samples -> Model -> Model
maximizeLikelihood xs model =
  let
    clusters' = map (updateParams xs) model.clusters
  in { model | clusters = clusters' }

{-| main function for calcurating GMEM.
-}
getGMEM : Samples -> Model -> Model
getGMEM xs model =
  let
    step xs model ll =
      let
        model' = model |> expectation xs |> maximizeLikelihood xs
        ll' = loglikelihood xs model'
        dummy = log "ll" ll'
      in if (abs (ll - ll') < epsilon)
        then model'
        else step xs model' ll'
  in step xs model 0

{-| convergency criteria
-}
epsilon : Float
epsilon = 1e-8

{-| get loglikelihood of the system.
  needed for convergency test.
-}
loglikelihood xs model =
  let
    partll cluster =
      let
        {params, weights} = cluster
        {mean, size, pmem} = params
      in sum <| map2 (\w x -> w * pdf x mean size) weights xs
  in logBase e <| sum <| map partll model.clusters

