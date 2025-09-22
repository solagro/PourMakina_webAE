import GeoJSON from "ol/format/GeoJSON";
import shp from "shpjs";

/**
 * Parses & extracts geographic data from a zipped shape file
 * @param {file} file File that we are extracting geo-spatial data from (zipped shapefile)
 * @param {map}  map The map where we want to add the layers
 * @param {layer} layer The layer where we want to add the geo-spatial data
 * @returns GeoJson object
 */
async function toGeojson(file, map, layer) {
  console.log("Loading file:", file.name);
  let geom = new GeoJSON();
  /* Transformation du fichier en Buffer */
  const buf = await file.arrayBuffer();
  if (file.name.endsWith(".zip")) {
    /* Conversion du Buffer en GeoJSON */
    shp(buf).then(function (data) {
      if (data.length > 1) {
        data.forEach(function (geoJSON) {
          console.log("geoJson: ", geoJSON);
          /* Création des features */
          var features = new GeoJSON().readFeatures(geoJSON, {
            /* Projection des données en entrée */
            dataProjection: "EPSG:2154",
            /* Transformation des features pour correspondre à la projection de la carte */
            featureProjection: map.getView().getProjection(),
          });
          /* Ajout des features à la source de la couche vectorielle */
          layer.getSource().addFeatures(features);
        });
      } else {
        /* Création des features */
        var features = new GeoJSON().readFeatures(data, {
          /* Projection des données en entrée */
          dataProjection: "EPSG:2154",
          /* Transformation des features pour correspondre à la projection de la carte */
          featureProjection: map.getView().getProjection(),
        });
        /* Ajout des features à la source de la couche vectorielle */
        layer.getSource().addFeatures(features);
      }
      /* Centrage de la carte sur les features de la couche vectorielle */
      map.getView().fit(layer.getSource().getExtent());
    });
  } else {
  }
}

export default toGeojson;
