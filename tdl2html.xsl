<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html"
				indent="yes"
				encoding="UTF-8"/>
	<xsl:template match="/">
		<ul>
			<xsl:apply-templates/>
		</ul>
	</xsl:template>

	<xsl:template match="TASK">
		<li>
			<xsl:value-of select="@TITLE"/>
			<xsl:if test="COMMENTS">
				<p><xsl:value-of select="COMMENTS"/></p>
			</xsl:if>

			<xsl:if test="FILEREFPATH">
				<p><a href="{FILEREFPATH}"><xsl:value-of select="FILEREFPATH"/></a></p>
			</xsl:if>
			<xsl:if test="TASK">
				<ul>
					<xsl:apply-templates/>
				</ul>
			</xsl:if>
		</li>
	</xsl:template>

	<xsl:template match="* | node()">
		<xsl:apply-templates/>
	</xsl:template>

</xsl:stylesheet>
