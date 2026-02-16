module.exports = function(grunt) {

  grunt.initConfig({
  
  scorm_manifest: {
  	custom_options: {
    	options: {
       		version: '1.2', 
        	courseId: 'WorkCare - Vaccine Administration', 		//Organsisation ID
        	SCOtitle: 'WorkCare - Vaccine Administration', //Course Title 
        	moduleTitle: 'WorkCare - Vaccine Administration', 		//Module Title
        	launchPage: 'index.html',	//First page
        	path: './'				//Export directory
    	},
    	files: [{
        	        expand: true,       
            	    cwd: './',
                	src: ['**/*.*'],
                	filter: 'isFile'
            	}],
		},
	}
  });

  grunt.loadNpmTasks('grunt-scorm-manifest');
  grunt.registerTask('default', ['scorm_manifest']);

};