/**
 * Adobe After Effects Automation Script (.jsx)
 * Creates a Broadcast-Ready Sports Lower-Third Composition
 * Pre-configured with exact layer names for Lottie / Bodymovin export:
 *  - "Name"       (Athlete Name)
 *  - "Team"       (Subtitle / Club)
 *  - "Number"     (Jersey #)
 *  - "Category"   (League / Header Tag)
 *  - "Stat 1"     (Primary Stat)
 *  - "Stat 2"     (Secondary Stat)
 * 
 * Usage in After Effects:
 *  File > Scripts > Run Script File... > Select this .jsx file
 */

(function createSportsLowerThirdProject() {
  app.beginUndoGroup("Generate Sports Lower-Third Composition");

  try {
    var compW = 1920;
    var compH = 1080;
    var compFps = 60;
    var compDuration = 5.0; // 5 seconds duration

    // 1. Create or get active project
    var proj = app.project ? app.project : app.newProject();

    // 2. Create the broadcast lower-third composition
    var comp = proj.items.addComp("Sports_Lower_Third_Lottie", compW, compH, 1.0, compDuration, compFps);
    comp.bgColor = [0, 0, 0]; // Transparent black

    var originX = 140; // Broadcast safe margin left
    var originY = 820; // Broadcast safe margin bottom

    // -------------------------------------------------------------
    // Helper: Create Text Layer
    // -------------------------------------------------------------
    function addTextLayer(name, defaultText, fontSize, posX, posY, colorArr) {
      var txtLayer = comp.layers.addText(defaultText);
      txtLayer.name = name;
      
      var txtProp = txtLayer.property("Source Text");
      var txtDoc = txtProp.value;
      txtDoc.fontSize = fontSize;
      txtDoc.fillColor = colorArr || [1, 1, 1];
      txtDoc.applyFill = true;
      txtDoc.applyStroke = false;
      txtDoc.justification = ParagraphJustification.LEFT_JUSTIFY;
      txtProp.setValue(txtDoc);

      txtLayer.property("Position").setValue([posX, posY, 0]);

      // Animate Entrance (Opacity + subtle Y drift)
      var opProp = txtLayer.property("Opacity");
      opProp.setValueAtTime(0.2, 0);
      opProp.setValueAtTime(0.5, 100);

      var posProp = txtLayer.property("Position");
      posProp.setValueAtTime(0.2, [posX, posY + 12, 0]);
      posProp.setValueAtTime(0.5, [posX, posY, 0]);

      return txtLayer;
    }

    // -------------------------------------------------------------
    // 3. Create Text Layers with Exact Lottie Naming
    // -------------------------------------------------------------
    // Header Category Badge
    var catLayer = addTextLayer("Category", "LIVE BROADCAST", 15, originX + 130, originY + 28, [1, 0.75, 0.1]); // Amber gold
    
    // Main Athlete Name (High-impact headline)
    var nameLayer = addTextLayer("Name", "KYLIAN MBAPPÉ", 44, originX + 130, originY + 74, [1, 1, 1]); // Pure White
    
    // Subtitle / Team Name
    var teamLayer = addTextLayer("Team", "REAL MADRID • FORWARD", 18, originX + 130, originY + 104, [0.8, 0.85, 0.92]); // Cool slate

    // Stat 1 (Primary Stat)
    var stat1Layer = addTextLayer("Stat 1", "GOALS: 18", 17, originX + 130, originY + 136, [0.0, 0.94, 1.0]); // Neon cyan

    // Stat 2 (Secondary Stat)
    var stat2Layer = addTextLayer("Stat 2", "ASSISTS: 7", 17, originX + 270, originY + 136, [0.0, 0.94, 1.0]); // Neon cyan

    // Jersey Number (Centered in the Jersey badge)
    var numLayer = comp.layers.addText("9");
    numLayer.name = "Number";
    var numDoc = numLayer.property("Source Text").value;
    numDoc.fontSize = 42;
    numDoc.fillColor = [1, 1, 1];
    numDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    numLayer.property("Source Text").setValue(numDoc);
    numLayer.property("Position").setValue([originX + 54, originY + 98, 0]);

    // Animate Number Layer
    numLayer.property("Opacity").setValueAtTime(0.15, 0);
    numLayer.property("Opacity").setValueAtTime(0.4, 100);

    // -------------------------------------------------------------
    // 4. Create Animated Jersey Badge (Shape Layer)
    // -------------------------------------------------------------
    var badgeLayer = comp.layers.addShape();
    badgeLayer.name = "Jersey_Badge_BG";
    badgeLayer.property("Position").setValue([originX + 54, originY + 84, 0]);

    var badgeGroup = badgeLayer.property("Contents").addProperty("ADBE Vector Group");
    badgeGroup.name = "Badge";
    var badgeRect = badgeGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    badgeRect.property("Size").setValue([88, 88]);
    badgeRect.property("Roundness").setValue(16);

    var badgeFill = badgeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    badgeFill.property("Color").setValue([0.1, 0.14, 0.22]); // Dark navy

    var badgeStroke = badgeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    badgeStroke.property("Color").setValue([0.88, 0.02, 0]); // Crimson accent
    badgeStroke.property("Stroke Width").setValue(3);

    // Bounce Scale Animation
    var badgeScale = badgeLayer.property("Scale");
    badgeScale.setValueAtTime(0.05, [0, 0, 100]);
    badgeScale.setValueAtTime(0.35, [112, 112, 100]);
    badgeScale.setValueAtTime(0.5, [100, 100, 100]);

    // Move badge behind the Number text layer
    badgeLayer.moveAfter(numLayer);

    // -------------------------------------------------------------
    // 5. Create Animated Accent Stripe (Shape Layer)
    // -------------------------------------------------------------
    var stripeLayer = comp.layers.addShape();
    stripeLayer.name = "Accent_Stripe";
    stripeLayer.property("Position").setValue([originX + 410, originY + 165, 0]);

    var stripeGroup = stripeLayer.property("Contents").addProperty("ADBE Vector Group");
    stripeGroup.name = "Stripe";
    var stripeRect = stripeGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    stripeRect.property("Size").setValue([820, 5]);
    stripeRect.property("Roundness").setValue(2);

    var stripeFill = stripeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    stripeFill.property("Color").setValue([0.88, 0.02, 0]); // Crimson

    // Expand width animation
    var stripeScale = stripeLayer.property("Scale");
    stripeScale.setValueAtTime(0.0, [0, 100, 100]);
    stripeScale.setValueAtTime(0.4, [100, 100, 100]);

    // -------------------------------------------------------------
    // 6. Create Main Dark Backplate (Shape Layer)
    // -------------------------------------------------------------
    var plateLayer = comp.layers.addShape();
    plateLayer.name = "Main_Backplate";
    plateLayer.property("Position").setValue([originX + 410, originY + 84, 0]);

    var plateGroup = plateLayer.property("Contents").addProperty("ADBE Vector Group");
    plateGroup.name = "Backplate";
    var plateRect = plateGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    plateRect.property("Size").setValue([820, 155]);
    plateRect.property("Roundness").setValue(16);

    var plateFill = plateGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    plateFill.property("Color").setValue([0.03, 0.05, 0.09]); // Studio slate-950

    var plateStroke = plateGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    plateStroke.property("Color").setValue([0.22, 0.28, 0.38]); // Subtle border
    plateStroke.property("Stroke Width").setValue(1.5);

    // Slide-In Position Animation
    var platePos = plateLayer.property("Position");
    platePos.setValueAtTime(0.0, [originX - 300, originY + 84, 0]);
    platePos.setValueAtTime(0.4, [originX + 410, originY + 84, 0]);

    var plateOp = plateLayer.property("Opacity");
    plateOp.setValueAtTime(0.0, 0);
    plateOp.setValueAtTime(0.2, 100);

    // Send backplate to bottom
    plateLayer.moveToEnd();

    // Open the composition in viewer
    comp.openInViewer();

    // Auto-save project file as Sports_Lower_Third.aep
    try {
      var scriptDir = (new File($.fileName)).parent;
      var aepFile = new File(scriptDir.fsName + "/Sports_Lower_Third.aep");
      app.project.save(aepFile);
    } catch (saveErr) {
      // Continue if save is skipped
    }

    alert(
      "SUCCESS! Sports Lower-Third Composition Created.\n\n" +
      "Saved to: sample_templates/Sports_Lower_Third.aep\n\n" +
      "Layers Configured for Lottie Export:\n" +
      " • 'Name' (Athlete Name)\n" +
      " • 'Team' (Subtitle)\n" +
      " • 'Number' (Jersey #)\n" +
      " • 'Category' (Header Tag)\n" +
      " • 'Stat 1' & 'Stat 2'\n\n" +
      "To Export as Lottie:\n" +
      "Open Window > Extensions > Bodymovin > Select this comp > Render!"
    );

  } catch (err) {
    alert("Error creating composition: " + err.toString());
  } finally {
    app.endUndoGroup();
  }
})();
