/*****************************************************************************************************************/
/***************** Visualisation du calcul d'indicateurs agro-écologiques à l'échelle d'une exploitation************************************/
/*****************************************************************************************************************/

/* ============================================= 
-- Auteur : Yasmina MEZILET
-- Date de création : 13/05/2025
-- Mise-à-jour : --/--/---- - Prénom NOM (TODO commentaire de la mise-à-jour)

-- ============================================= */

/*****IMPORT DES MODULES ****************************** */
import "./style.css";
import "ol-ext/dist/ol-ext.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Vector as VectorSource } from "ol/source.js";
import { Vector as VectorLayer } from "ol/layer.js";
import GeoJSON from "ol/format/GeoJSON";
/* Layer switcher (not popup) */
import LayerPopup from "ol-ext/control/LayerPopup.js";
/* Pop Up Feature */
import PopupFeature from "ol-ext/overlay/PopupFeature.js";
import legendCtrl from "ol-ext/control/Legend.js";
import Legend from "ol-ext/legend/Legend.js";
import toGeojson from "./Scripts/shptoGeojson.js";
import proj4 from "proj4";
import { register } from "ol/proj/proj4.js";
import SLDReader from "@nieuwlandgeo/sldreader/dist/sldreader.js";
import { Fill, Stroke, Style, Text } from "ol/style.js";
import { Select, defaults as defaultInteractions } from "ol/interaction.js";
import PrintDialog from "ol-ext/control/PrintDialog.js";
import * as Conditions from "ol/events/condition.js";
/*Overlay Menu*/
import Overlay from "ol-ext/control/Overlay.js";
import Toggle from "ol-ext/control/Toggle.js";
import { getJSON } from "./node_modules/simple-get-json/dist/index-es.js";
/*********FIN DES IMPORTS **************************** */
/**************************************************** */

/* Projection */
/* La projection EPSG:2154 est utilisée pour les données du RPG Drag */
proj4.defs(
  "EPSG:2154",
  "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);
/* Register la projection */
register(proj4);

/*Style */

//fichiers de style
const styleurl = [
  "styles/rpg_adonis_couleur_sans_etiquette.xml",
  "styles/prairies_humides.xml",
  "styles/style_lisiere2.xml",
  "styles/style_haies.xml",
  "styles/style_bni.xml",
  "styles/style_bio.xml",
  "styles/style_couvert_hiver.xml",
  "styles/style_sth_pt.xml",
  "styles/style_non_traitee.xml",
  "styles/style_leg.xml",
];

let rpg_colors = [];

/* global ol SLDReader CodeMirror */

/**
 * @param {object} vector layer
 * @param {string} text the xml text
 * apply sld
 */
/* Function Apply SLD */
function applySLD(vectorLayer, text) {
  // Create a new SLDReader instance.
  const sldObject = SLDReader.Reader(text);
  // Create a new SLD layer from the SLDReader instance.
  const sldLayer = SLDReader.getLayer(sldObject);
  // Set the style of the vector layer to the SLD layer.
  const style = SLDReader.getStyle(sldLayer);
  // Get the first feature type style from the SLD.
  const featureTypeStyle = style.featuretypestyles[0];

  const viewProjection = map.getView().getProjection();
  // Set the style of the vector layer to the SLD layer.
  vectorLayer.setStyle(
    // Create a style function with the SLD feature type style.
    SLDReader.createOlStyleFunction(featureTypeStyle, {
      // Use the convertResolution option to calculate a more accurate resolution.
      convertResolution: (viewResolution) => {
        const viewCenter = map.getView().getCenter();
        return ol.proj.getPointResolution(
          viewProjection,
          viewResolution,
          viewCenter
        );
      },
      // If you use point icons with an ExternalGraphic, you have to use imageLoadCallback
      // to update the vector layer when an image finishes loading.
      // If you do not do this, the image will only be visible after next layer pan/zoom.
      imageLoadedCallback: () => {
        vectorLayer.changed();
      },
    })
  );
}

/* apply Prairies humides style */
var style_zh = SLDReader.createOlStyleFunction(
  SLDReader.getStyle(SLDReader.getLayer(SLDReader.Reader(await fun(1))))
    .featuretypestyles[0]
);
/* apply RPG style (sans étiquette)*/
var style_rpg = SLDReader.createOlStyleFunction(
  SLDReader.getStyle(SLDReader.getLayer(SLDReader.Reader(await fun(0))))
    .featuretypestyles[0]
);
/* apply Lisières boisées style */
var style_lis = SLDReader.createOlStyleFunction(
  SLDReader.getStyle(SLDReader.getLayer(SLDReader.Reader(await fun(2))))
    .featuretypestyles[0]
);
/* apply Haies style */
var style_haie = SLDReader.createOlStyleFunction(
  SLDReader.getStyle(SLDReader.getLayer(SLDReader.Reader(await fun(3))))
    .featuretypestyles[0]
);

/* apply style BNI*/
var style_bni = SLDReader.createOlStyleFunction(
  SLDReader.getStyle(SLDReader.getLayer(SLDReader.Reader(await fun(4))))
    .featuretypestyles[0]
);
/* apply style BIO*/
var style_bio = SLDReader.createOlStyleFunction(
  SLDReader.getStyle(SLDReader.getLayer(SLDReader.Reader(await fun(5))))
    .featuretypestyles[0]
);
/* apply style Couvert Hiver*/
var style_chiver = SLDReader.createOlStyleFunction(
  SLDReader.getStyle(SLDReader.getLayer(SLDReader.Reader(await fun(6))))
    .featuretypestyles[0]
);

/* apply style STH PT*/
var style_sth_pt = SLDReader.createOlStyleFunction(
  SLDReader.getStyle(SLDReader.getLayer(SLDReader.Reader(await fun(7))))
    .featuretypestyles[0]
);
/* apply style non traitée*/
var style_nt = SLDReader.createOlStyleFunction(
  SLDReader.getStyle(SLDReader.getLayer(SLDReader.Reader(await fun(8))))
    .featuretypestyles[0]
);
/* apply stylelégumineuse*/
var style_leg = SLDReader.createOlStyleFunction(
  SLDReader.getStyle(SLDReader.getLayer(SLDReader.Reader(await fun(9))))
    .featuretypestyles[0]
);
/* Fetch style file */
async function fun(index) {
  const url = styleurl[index];
  const response = await fetch(url).then((response) => response.text());
  return response;
}
/* STYLE DE SELECTION*/
const selectedParc = [
  new Style({
    stroke: new Stroke({
      color: "white",
      width: 6,
      zindex: 1,
    }),
  }),
  new Style({
    stroke: new Stroke({
      color: "#4b4b4c",
      width: 2,
      zindex: 0,
    }),
  }),
];
/*Style étiquette libellé de culture + surface en ha */

const label_rpg = (feature, resolution) => {
  const props = feature.getProperties();
  var zoom = map.getView().getZoom();
  let lbl = new Style({});
  const label = new Text({
    font: "12px Calibri,sans-serif",
    fill: new Fill({
      color: "#000",
    }),
    stroke: new Stroke({
      color: "#fff",
      width: 3,
    }),
    text: feature.get("TYPE") + "\n" + feature.get("SURF") + " ha",
  });
  // envoit le text
  lbl.setText(label);
  return lbl;
};
const labelStyle = new Style({
  text: new Text({
    font: "13px Calibri,sans-serif",
    fill: new Fill({
      color: "#000",
    }),
    stroke: new Stroke({
      color: "#fff",
      width: 4,
    }),
  }),
});
/********* FIN DES STYLES **************************** */
/* Ajout d'une couche vectorielle pour le RPG Drag */
/* Données issues du Drop sous format string geojson pour intégration à BDD */
let rpg;
let geom = new GeoJSON();
/* Création de la source de données pour la couche vectorielle */
const sourceDrop = new VectorSource({ format: new GeoJSON() });
/* Création de la couche vectorielle */
const layerDrop = new VectorLayer({
  source: sourceDrop,
  name: "RPG Drag",
  style: style_rpg,
});

/* Chargement de la couche */
function loadSource(source, url) {
  $.ajax(url, function (response) {
    var geojsonFormat = new GeoJSON();
    source.clear(true);
    source.addFeatures(geojsonFormat.readFeatures(response));
  });
}

/* Layer Indicateurs Exploitation from DB */
var layerExp = new VectorLayer({
  title: "",
  source: new VectorSource({
    url:
      "http://localhost:9000/functions/postgisftw.indicateurs_ae_exploitation/items.json?limit=5000&in_geom=" +
      rpg,
    format: new GeoJSON(),
    projection: "EPSG:3857",
    features: [],
  }),
  style: style_rpg,
});

/* La carte */
const map = new Map({
  target: "map",
  layers: [
    new TileLayer({
      source: new OSM({}),
      baseLayer: true,
      name: "OpenStreetMap",
    }),
  ],
  view: new View({
    center: [299633.1509, 5881370.7044],
    zoom: 6,
  }),
});

/*Controls */

/* Legende */
const legende = new Legend({
  title: "Légende",
  margin: 5,
  maxWidth: 300,
});

const legendeControl = new legendCtrl({
  legend: legende,
  collapsed: false,
});

/*ajout légende à la carte */
map.addControl(legendeControl);

/* Chargement d'un ou plusieurs shapefiles stockés dans un dossier .zip glissé/déposé sur la carte */

/* ajout évennement Drag */
/* Définition du dragover */
map.getViewport().addEventListener("dragover", function (event) {
  /* Eviter le comportement par défaut */
  event.preventDefault();
});
/*Définition du drop */
let geo;
map.getViewport().addEventListener("drop", function (event) {
  /* Eviter le comportement par défaut */
  event.preventDefault();
  /* Récupération des données du drop */
  /* Récupération des shapefiles dans un dossier.zip */
  const files = event.dataTransfer.files;
  /* Chargement des shapefiles */
  for (let i = 0, ii = files.length; i < ii; ++i) {
    const file = files.item(i);
    /* Transformation des shapefiles en GeoJSON */
    geo = toGeojson(file, map, layerDrop);
  }
});

var rpgdropLegend = new Legend({
  layer: layerDrop,
  title: "RPG Drag",
});

/*Async wait for reading of RPG style file */
let result = await fun(0);

/*Function qui fait un wrap autour d'un text trop long*/
function stringDivider(str, width, spaceReplacer) {
  if (str.length > width) {
    var p = width;
    for (; p > 0 && str[p] != " "; p--) {}
    if (p > 0) {
      var left = str.substring(0, p);
      var right = str.substring(p + 1);
      return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
    }
  }
  return str;
}

/* Association de la légende à la couche vectorielle */
let rpg_lbl = [];
let layerHvn;
let layerHaies;
let layerLisieres;
let layerZH;
let layerBni;
let layerBio;
let layerchiver;
let layersthpt;
let layerNT;
let layerLeg;

/*Au drop appeler la fonction de calcul des indicateurs */
layerDrop.on("change", function () {
  console.log("rpg drag changed");
  console.log(layerDrop.getSource().getUrl());
  // New legend associated with a layer

  /* Get Data as a geojson string */
  rpg = geom.writeFeatures(sourceDrop.getFeatures());

  console.log("rpg: ", rpg);

  // Layers
  layerExp = new VectorLayer({
    title: "Assolement",
    source: new VectorSource({
      url:
        "http://localhost:9000/functions/postgisftw.indicateurs_ae_exploitation/items.json?limit=5000&in_geom=" +
        rpg,
      format: new GeoJSON(),
      projection: "EPSG:3857",
      features: [],
    }),
    style: style_rpg,
  });
  layerBni = new VectorLayer({
    title: "Parcelles à bas niveau d'intrants",
    source: new VectorSource({
      url:
        "http://localhost:9000/functions/postgisftw.indicateurs_ae_exploitation/items.json?limit=5000&in_geom=" +
        rpg,
      format: new GeoJSON(),
      projection: "EPSG:3857",
      features: [],
    }),
    visible: false,
    style: style_bni,
  });
  layerHvn = new VectorLayer({
    title: "Score HVN",
    source: new VectorSource({
      url:
        "http://localhost:9000/functions/postgisftw.hvn_score_total_rpgexp/items.json?limit=5000&territoire=web&in_geom=" +
        rpg,
      format: new GeoJSON(),
      projection: "EPSG:3857",
      features: [],
    }),
    visible: false,
    style: style_rpg,
  });
  layerHaies = new VectorLayer({
    title: "Haies",
    source: new VectorSource({
      url:
        "http://localhost:9000/functions/postgisftw.hvn_i3_haies_rpgexp/items.json?limit=5000&territoire=web&in_geom=" +
        rpg,
      format: new GeoJSON(),
      projection: "EPSG:3857",
      features: [],
    }),
    visible: false,
    style: style_haie,
  });
  layerLisieres = new VectorLayer({
    title: "Lisières de bois",
    source: new VectorSource({
      url:
        "http://localhost:9000/functions/postgisftw.hvn_i3_lisieres_boisees_rpgexp/items.json?limit=5000&territoire=web&in_geom=" +
        rpg,
      format: new GeoJSON(),
      projection: "EPSG:3857",
      features: [],
    }),
    visible: false,
    style: style_lis,
  });
  layerZH = new VectorLayer({
    title: "Prairies Humides",
    source: new VectorSource({
      url:
        "http://localhost:9000/functions/postgisftw.hvn_i3_prairies_naturelles_rpgexp/items.json?limit=5000&territoire=web&in_geom=" +
        rpg,
      format: new GeoJSON(),
      projection: "EPSG:3857",
      features: [],
    }),
    visible: false,
    style: style_zh,
  });
  layerBio = new VectorLayer({
    title: "Parcelles en agriculture biologique",
    source: new VectorSource({
      url:
        "http://localhost:9000/functions/postgisftw.indicateurs_ae_exploitation/items.json?limit=5000&in_geom=" +
        rpg,
      format: new GeoJSON(),
      projection: "EPSG:3857",
      features: [],
    }),
    visible: false,
    style: style_bio,
  });
  layerchiver = new VectorLayer({
    title: "Sol couvert en hiverpar la culture principale",
    source: new VectorSource({
      url:
        "http://localhost:9000/functions/postgisftw.indicateurs_ae_exploitation/items.json?limit=5000&in_geom=" +
        rpg,
      format: new GeoJSON(),
      projection: "EPSG:3857",
      features: [],
    }),
    visible: false,
    style: style_chiver,
  });
  layersthpt = new VectorLayer({
    title: "Surface toujours en herbe (y compris prairies temporaires)",
    source: new VectorSource({
      url:
        "http://localhost:9000/functions/postgisftw.indicateurs_ae_exploitation/items.json?limit=5000&in_geom=" +
        rpg,
      format: new GeoJSON(),
      projection: "EPSG:3857",
      features: [],
    }),
    visible: false,
    style: style_sth_pt,
  });
  layerNT = new VectorLayer({
    title: "Surface non traitée",
    source: new VectorSource({
      url:
        "http://localhost:9000/functions/postgisftw.indicateurs_ae_exploitation/items.json?limit=5000&in_geom=" +
        rpg,
      format: new GeoJSON(),
      projection: "EPSG:3857",
      features: [],
    }),
    visible: false,
    style: style_nt,
  });
  layerLeg = new VectorLayer({
    title: "Légumineuses",
    source: new VectorSource({
      url:
        "http://localhost:9000/functions/postgisftw.indicateurs_ae_exploitation/items.json?limit=5000&in_geom=" +
        rpg,
      format: new GeoJSON(),
      projection: "EPSG:3857",
      features: [],
    }),
    visible: false,
    style: style_leg,
  });

  // Add layers to map
  if (layerDrop.getSource().getState() === "ready") {
    map.addLayer(layerExp);
    map.addLayer(layerHvn);
    map.addLayer(layerHaies);
    map.addLayer(layerLisieres);
    map.addLayer(layerZH);
    map.addLayer(layerBni);
    map.addLayer(layerBio);
    map.addLayer(layerchiver);
    map.addLayer(layersthpt);
    map.addLayer(layerNT);
    map.addLayer(layerLeg);
  }
  // Set style
  layerExp.setStyle(label_rpg);
  layerExp.setStyle(style_rpg);
  var parser = new DOMParser();

  /* Lire le fichier de style du RPG */
  var xmlDoc = parser.parseFromString(result, "text/xml");
  var tags = xmlDoc.getElementsByTagName("se:Title");
  for (let i = 0; i < tags.length; i++) {
    if (rpg_lbl.includes(tags[i].childNodes[0].nodeValue) == false) {
      rpg_lbl.push(tags[i].childNodes[0].nodeValue);
    }
  }
  for (
    let i = 0;
    i < xmlDoc.getElementsByTagName("se:SvgParameter").length;
    i++
  ) {
    if (
      xmlDoc.getElementsByTagName("se:SvgParameter")[i].attributes.name
        .nodeValue == "fill"
    ) {
      if (
        rpg_colors.includes(
          xmlDoc.getElementsByTagName("se:SvgParameter")[i].childNodes[0]
            .nodeValue
        ) == false
      ) {
        rpg_colors.push(
          xmlDoc.getElementsByTagName("se:SvgParameter")[i].childNodes[0]
            .nodeValue
        );
      }
    }
  }
  let cult_in_rpg = [];
  let colors_in_rpg = [];
  // Display the legend for elements in layer
  layerExp.getSource().on("featuresloadend", function () {
    layerExp.getSource().forEachFeature(function (feature) {
      if (cult_in_rpg.includes(feature.get("lib_style")) == false) {
        cult_in_rpg.push(feature.get("lib_style"));
      }
    });

    // Display in the legend only visible features (selected features)
    var assolementLegend = new Legend({ layer: layerExp });
    for (let i = 0; i < cult_in_rpg.length; i++) {
      for (let key in rpg_lbl) {
        if (rpg_lbl[key] === cult_in_rpg[i]) {
          assolementLegend.addItem({
            title: rpg_lbl[key],
            typeGeom: "Polygon",
            style: new Style({
              fill: new Fill({ color: rpg_colors[key] }),
            }),
          });
        }
      }
    }
    legende.getItems().clear();
    legende.addItem(assolementLegend);
    // Légende HVN- Assolement
    var hvnLegend = new Legend({ layer: layerHvn });
    for (let i = 0; i < cult_in_rpg.length; i++) {
      for (let key in rpg_lbl) {
        if (rpg_lbl[key] === cult_in_rpg[i]) {
          hvnLegend.addItem({
            title: rpg_lbl[key],
            typeGeom: "Polygon",
            style: new Style({
              fill: new Fill({ color: rpg_colors[key] }),
            }),
          });
        }
      }
    }
    legende.addItem(hvnLegend);
    /*Légende Haies*/
    var haiesLegend = new Legend({ layer: layerHaies });
    haiesLegend.addItem({
      title: "Haie",
      typeGeom: "LineString",
      style: style_haie,
    });

    legende.addItem(haiesLegend);
    /*Légende Lisières*/
    var lisLegend = new Legend({ layer: layerLisieres });
    lisLegend.addItem({
      title: "Lisière boisée",
      typeGeom: "LineString",
      style: style_lis,
    });

    legende.addItem(lisLegend);
    /*Légende Prairie humide*/
    var phLegend = new Legend({ layer: layerZH });
    phLegend.addItem({
      title: "Prairie humide",
      typeGeom: "Polygon",
      style: style_zh,
    });

    legende.addItem(phLegend);
    /* Légende BNI*/
    var bniLegend = new Legend({ layer: layerBni });
    bniLegend.addItem({
      title: "Bas niveau d'intrant",
      typeGeom: "Polygon",
      style: new Style({
        fill: new Fill({ color: "#33a02c" }),
      }),
    });
    bniLegend.addItem({
      title: "Autre",
      typeGeom: "Polygon",
      style: new Style({
        fill: new Fill({ color: "#676767" }),
      }),
    });
    legende.addItem(bniLegend);
    /*Légende BIO*/

    var bioLegend = new Legend({ layer: layerBio });
    bioLegend.addItem({
      title: "Parcelle BIO",
      typeGeom: "Polygon",
      style: new Style({
        fill: new Fill({ color: "#33a02c" }),
      }),
    });
    bioLegend.addItem({
      title: "Parcelle Non-BIO",
      typeGeom: "Polygon",
      style: new Style({
        fill: new Fill({ color: "#676767" }),
      }),
    });
    legende.addItem(bioLegend);

    /*Légende Couvert hiver*/

    var chiverLegend = new Legend({ layer: layerchiver });
    chiverLegend.addItem({
      title: "Sol couvert en hiver par la" + "\n" + "culture principale",
      typeGeom: "Polygon",
      style: new Style({
        fill: new Fill({ color: "#ff7f00" }),
      }),
    });
    chiverLegend.addItem({
      title: "Sol partiellement couvert en" + "\n" + "hiver",
      typeGeom: "Polygon",
      style: new Style({
        fill: new Fill({ color: "#fdbf6f" }),
      }),
    });
    chiverLegend.addItem({
      title:
        "Sol non couvert en hiver par la" +
        "\n" +
        "culture principale" +
        "\n" +
        "(mais peut être couvert par une interculture)",
      typeGeom: "Polygon",
      titleStyle: "9px sans-serif",
      style: new Style({
        fill: new Fill({ color: "#676767" }),
      }),
    });
    legende.addItem(chiverLegend);

    /*Légende STH PT*/

    var sthptLegend = new Legend({ layer: layersthpt });
    sthptLegend.addItem({
      title: "Parcelle toujours en herbe",
      typeGeom: "Polygon",
      style: new Style({
        fill: new Fill({ color: "#33a02c" }),
      }),
    });
    sthptLegend.addItem({
      title: "Autre",
      typeGeom: "Polygon",
      style: new Style({
        fill: new Fill({ color: "#676767" }),
      }),
    });
    legende.addItem(sthptLegend);

    /*Légende Non traitée*/

    var ntLegend = new Legend({ layer: layerNT });
    ntLegend.addItem({
      title: "Parcelle non-traitée",
      typeGeom: "Polygon",
      style: new Style({
        fill: new Fill({ color: "#33a02c" }),
      }),
    });
    ntLegend.addItem({
      title: "Surface traitée",
      typeGeom: "Polygon",
      style: new Style({
        fill: new Fill({ color: "#e31a1c" }),
      }),
    });
    legende.addItem(ntLegend);
    /*Légende Non traitée*/

    var legLegend = new Legend({ layer: layerLeg });
    legLegend.addItem({
      title: "Légumineuse",
      typeGeom: "Polygon",
      style: new Style({
        fill: new Fill({ color: "#33a02c" }),
      }),
    });
    legLegend.addItem({
      title: "Autre",
      typeGeom: "Polygon",
      style: new Style({
        fill: new Fill({ color: "#676767" }),
      }),
    });
    legende.addItem(legLegend);
  });

  /* Display informations in the overlay menu*/
  let info;
  getJSON(
    "http://localhost:9000/functions/postgisftw.indicateurs_ae_exploitation/items.json?limit=5000&in_geom=" +
      rpg,
    function (data) {
      /*Dans overlay menu*/
      info = $("<div>")
        .append($("<tr>"))
        .append($("<th>").text("SAU"))
        .append(
          $("<td>").text(data.features[0].properties.sau.toFixed(2) + "ha")
        )
        .append($("<tr>"))
        .append($("<th>").text("SAU BIO"))
        .append(
          $("<td>").text(data.features[0].properties.sau_bio.toFixed(2) + " ha")
        )
        .append($("<tr>"))
        .append($("<th>").text("Part de l'agriculture biologique"))
        .append(
          $("<td>").text(data.features[0].properties.p_bio.toFixed(2) + " %")
        );
    }
  );
  /* ADD HVN info*/
  getJSON(
    "http://localhost:9000/functions/postgisftw.hvn_score_total_rpgexp/items.json?limit=5000&territoire=web&in_geom=" +
      rpg,
    function (data) {
      info
        .append($("<tr>"))
        .append($("<th>").text("Diversité de l’assolement sur 10 points"))
        .append(
          $("<td>").text(data.features[0].properties.score_i1_grpb.toFixed(2))
        )
        .append($("<tr>"))
        .append($("<th>").text("Extensivité des pratiques sur 10 points"))
        .append(
          $("<td>").text(data.features[0].properties.score_hvn_i2.toFixed(2))
        )
        .append($("<tr>"))
        .append($("<th>").text("Diversité des infrastructures agroécologiques"))
        .append($("<td>").text(data.features[0].properties.score_i3.toFixed(2)))
        .append($("<tr>"))
        .append($("<th>").text("Score Haute Valeur Naturelle sur 30 points"))
        .append(
          $("<td>").text(data.features[0].properties.score_hvn_total.toFixed(2))
        )
        .append($("<tr>"))
        .append($("<th>").text("Longueur totale de haie"))
        .append(
          $("<td>").text(data.features[0].properties.len_haies_exp.toFixed(2))
        )
        .append($("<tr>"))
        .append($("<th>").text("Longueur totale de lisière de bois"))
        .append(
          $("<td>").text(
            data.features[0].properties.len_lisieres_exp.toFixed(2)
          )
        )
        .append($("<tr>"))
        .append($("<th>").text("Densité des haies et lisières de bois"))
        .append(
          $("<td>").text(
            data.features[0].properties.densite_haies_lisiere.toFixed(2)
          )
        )
        .append($("<tr>"))
        .append(
          $("<th>").text("Surface totale de prairies permanentes humides")
        )
        .append(
          $("<td>").text(data.features[0].properties.surf_prairie_nat_exp)
        )
        .append($("<tr>"))
        .append($("<th>").text("Part de prairies permanentes humides"))
        .append(
          $("<td>").text(data.features[0].properties.part_prai_nat.toFixed(2))
        );
    }
  );
  /* Camembert représentant les 5 cultures principales de l'exploitation */
  getJSON(
    "http://localhost:9000/functions/postgisftw.get_principales_cultures_exploitation/items.json?limit=5000&in_geom=" +
      rpg,
    function (data) {
      /* Couleurs du camembert doivent être les m^mes que dans assolement*/
      for (let i = 0; i < data.length; i++) {
        for (let key in rpg_lbl) {
          if (data[i].lib_style === "Autres") {
            colors_in_rpg.splice(i, 0, "#676767");
          }
          if (
            rpg_lbl[key] === data[i].lib_style &&
            data[i].lib_style !== "Autres"
          ) {
            console.log("i:", i);
            colors_in_rpg.splice(i, 0, rpg_colors[key]);
            console.log("data[i]:", data[i].lib_style);
          }
        }
      }
      /*Dans overlay menu*/
      //Plotly
      //Basic Pie
      var data = [
        {
          values: [
            /*Part de la culture dans la SAU de l'exploitation */
            data[0].p_cult,
            data[1].p_cult,
            data[2].p_cult,
            data[3].p_cult,
            data[4].p_cult,
            data[5].p_cult,
          ],
          /*Libellé de la culture */
          labels: [
            stringDivider(data[0].lib_style, 20, "<br>"),
            stringDivider(data[1].lib_style, 20, "<br>"),
            stringDivider(data[2].lib_style, 20, "<br>"),
            stringDivider(data[3].lib_style, 20, "<br>"),
            stringDivider(data[4].lib_style, 20, "<br>"),
            stringDivider(data[5].lib_style, 20, "<br>"),
          ],
          /*Couleur dans pie */
          marker: {
            colors: [
              colors_in_rpg[0],
              colors_in_rpg[1],
              colors_in_rpg[2],
              colors_in_rpg[3],
              colors_in_rpg[4],
              colors_in_rpg[5],
            ],
          },
          textinfo: "label+percent",

          type: "pie",
        },
      ];

      var layout = {
        height: 1000,

        width: 1000,
        title: {
          text: "Cultures principales",
        },
        font: {
          family: "Calibri",

          size: 24,

          color: "#7f7f7f",
        },
        showlegend: false,
      };

      Plotly.newPlot("myDiv", data, layout);
      //image URL

      let imgurl;
      /*Camembert au format image pour pouvoir l'insérer dans Overlay menu */
      Plotly.toImage("myDiv", {
        format: "png", //also can use 'jpeg', 'webp', 'svg'
        height: 1000,
        width: 1000,
      }).then(function (dataUrl) {
        // use the dataUrl
        console.log(dataUrl);
        imgurl = dataUrl;
        var img = $("<img width=1000 height=450>").attr("src", imgurl);
        var content = $("<div>").append(info).append(img);
        $(".data").html(content);
      });
    }
  );
});

// Select  interaction
var select = new Select({
  hitTolerance: 5,
  multi: true,
  condition: Conditions.singleClick,
  style: selectedParc,
});
map.addInteraction(select);
/* Layer switcher*/
const layerSwitcher = new LayerPopup();
map.addControl(layerSwitcher);

/* Pop up feature*/
var popup = new PopupFeature({
  popupClass: "default anim",
  select: select,
  canFix: true,
  template: {
    title: function (f) {
      console.log("f: ", f);
      return "Parcelle: " + f.get("numero_i") + "_" + f.get("numero_p");
    },
    attributes: {
      dpt_num: { title: "Département" },
      commune: { title: "Commune" },
      surf: {
        title: "Surface",
        format: function (val, f) {
          if (f.get("surf")) {
            return Math.round(f.get("surf"), 2).toLocaleString() + " ha";
          } else {
            return "0 ha";
          }
        },
      },
      type: { title: "Code culture" },
      libelle_simplifie_web: { title: "Nom culture" },
      hvn_i1_lib_new: { title: "Classe de la culture dans l'indicateur 1" },
      lib_hvn_i2: { title: "Classe de la culture dans l'indicateur 2" },
      agribio: {
        title: "Parcelle en Agriculture biologique",
        format: function (val, f) {
          if (f.get("agribio")) {
            return "Oui";
          } else {
            return "Non";
          }
        },
      },
      len_haies_parc: {
        title: "Longueur de haie",
        format: function (val, f) {
          if (f.get("len_haies_parc")) {
            return (
              Math.round(f.get("len_haies_parc"), 2).toLocaleString() + " m"
            );
          } else {
            return "0 m";
          }
        },
      },
      len_lisieres_parc: {
        title: "Longueur de lisière de bois",
        format: function (val, f) {
          if (f.get("len_lisieres_parc")) {
            return (
              Math.round(f.get("len_lisieres_parc"), 2).toLocaleString() + " m"
            );
          } else {
            return "0 m";
          }
        },
      },
      surf_prairie_nat_parc: {
        title: "Surface de zone humide",
        format: function (val, f) {
          if (f.get("surf_prairie_nat_parc")) {
            return (
              Math.round(f.get("surf_prairie_nat_parc"), 2).toLocaleString() +
              " ha"
            );
          } else {
            return "0 ha";
          }
        },
      },
    },
  },
});
map.addOverlay(popup);

// Event on attribute click
popup.on("attribute", console.log);

/* Overlay menu*/
// Overlay --> pour présenter les informations pour toute l'exploitation pas par parcelle
var menu = new Overlay({
  closeBox: true,
  className: "slide-left menu",
  content: $("#menu").get(0),
});
map.addControl(menu);

// A toggle control to show/hide the menu
var t = new Toggle({
  html: '<i class="fa fa-bars" ></i>',
  className: "menu",
  title: "Menu",
  onToggle: function () {
    menu.toggle();
  },
});
map.addControl(t);

// Print control
var printControl = new PrintDialog({ lang: "fr" });
printControl.setSize("A4");
map.addControl(printControl);
